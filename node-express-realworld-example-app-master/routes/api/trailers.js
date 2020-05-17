var router = require('express').Router();
var mongoose = require('mongoose');
var Trailer = mongoose.model('Trailer');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload trailer objects on routes with ':trailer'
router.param('trailer', function(req, res, next, slug) {
  Trailer.findOne({ slug: slug})
    .populate('author')
    .then(function (trailer) {
      if (!trailer) { return res.sendStatus(404); }

      req.trailer = trailer;

      return next();
    }).catch(next);
});

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.sendStatus(404); }

    req.comment = comment;

    return next();
  }).catch(next);
});


router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  if( typeof req.query.tag !== 'undefined' ){
    query.tagList = {"$in" : [req.query.tag]};
  }

  Promise.all([
    req.query.author ? User.findOne({username: req.query.author}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var author = results[0];
    var favoriter = results[1];

    if(author){
      query.author = author._id;
    }

    if(favoriter){
      query._id = {$in: favoriter.favorites};
    } else if(req.query.favorited){
      query._id = {$in: []};
    }

    return Promise.all([
      Trailer.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      Trailer.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var trailers = results[0];
      var trailersCount = results[1];
      var user = results[2];

      return res.json({
        trailers: trailers.map(function(trailer){
          return trailer.toJSONFor(user);
        }),
        trailersCount: trailersCount
      });
    });
  }).catch(next);
});

router.get('/feed', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    Promise.all([
      Trailer.find({ author: {$in: user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
      Trailer.count({ author: {$in: user.following}})
    ]).then(function(results){
      var trailers = results[0];
      var trailersCount = results[1];

      return res.json({
        trailers: trailers.map(function(trailer){
          return trailer.toJSONFor(user);
        }),
        trailersCount: trailersCount
      });
    }).catch(next);
  });
});

/*
Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYWViOTEwODIxODhiMGYzMjRmODMwOCIsInVzZXJuYW1lIjoic2FhcmExMjMiLCJleHAiOjE1OTQ5MDcyMTcsImlhdCI6MTU4OTcyMzIxN30.jv5WHBbQdDl5yplWTqWpykStim_kVhZubeivZQZtUaw
{
  "trailer": {
    "body": "123",
    "location": "123",
    "title": "123",
    "tagList": []
  }
}
*/


/**
 * @swagger
 * /trailers:
 *   post:
 *     summary: changes the trailer
 *     security:
 *       - auth: []
 *     description:
 *       "Required roles: `admin`"
 *     tags:
 *       - trailer
 *     requestBody:
 *         description: Optional
 *         required: true
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                required:
 *                - trailer
 *                properties:
 *                  trailer:
 *                    type: object
 *                    schema:
 *                           type: object
 *                           required:
 *                           - title
 *                           - location
 *                           - body
 *                           - tagList
 *                           properties:
 *                             title:
 *                               type: string
 *                             location:
 *                               type: string
 *                             body:
 *                               type: string
 *                             tagList:
 *                               type: string
 *                    example: {
 *                      "body": "123",
 *                      "location": "123",
 *                      "title": "123",
 *                      "tagList": []
 *                   }
 */


router.post('/', auth.required, function(req, res, next) {
  // console.log('test payload', req.payload, req.body)
  User.findById(req.payload.id).then(function(user){
    // console.log('test user', user)
    if (!user) { return res.sendStatus(401); }
    // console.log('test trailer', req.body.trailer)
    var trailer = new Trailer(req.body.trailer);
    // console.log('test EI ILMU', req.body.trailer)
    trailer.author = user;

    return trailer.save().then(function(){
      console.log('test author', trailer.author);
      return res.json({trailer: trailer.toJSONFor(user)});
    });
  }).catch(next);
});


router.get('/:trailer', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.trailer.populate('author').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({trailer: req.trailer.toJSONFor(user)});
  }).catch(next);
});



/**
 * @swagger
 * /trailers/{slug}:
 *   put:
 *     summary: update the trailer by SLUG
 *     security:
 *       - auth: []
 *     description:
 *       "Required roles: `admin`"
 *     tags:
 *       - trailer
 *     parameters:
 *     - in: path
 *       name: slug
 *       schema:
 *          type: string
 *       required: true
 *       description: slug of the trailer
 *     requestBody:
 *         description: Optional
 *         required: true
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                required:
 *                - trailer
 *                properties:
 *                  trailer:
 *                    type: object
 *                    schema:
 *                           type: object
 *                           required:
 *                           - title
 *                           - location
 *                           - body
 *                           - tagList
 *                           properties:
 *                             title:
 *                               type: string
 *                             location:
 *                               type: string
 *                             body:
 *                               type: string
 *                             tagList:
 *                               type: string
 *                    example: {
 *                      "body": "123",
 *                      "location": "123",
 *                      "title": "123",
 *                      "tagList": []
 *                   }
 */

// update trailer
router.put('/:trailer', auth.required, function(req, res, next) {
  console.log('test', req, res, next)
  User.findById(req.payload.id).then(function(user){
    if(req.trailer.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.trailer.title !== 'undefined'){
        req.trailer.title = req.body.trailer.title;
      }

      if(typeof req.body.trailer.location!== 'undefined'){
        req.trailer.location = req.body.trailer.location;
      }

      if(typeof req.body.trailer.body !== 'undefined'){
        req.trailer.body = req.body.trailer.body;
      }

      if(typeof req.body.trailer.tagList !== 'undefined'){
        req.trailer.tagList = req.body.trailer.tagList
      }

      req.trailer.save().then(function(trailer){
        return res.json({trailer: trailer.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete trailer

/**
 * @swagger
 * /trailers/{slug}:
 *   delete:
 *     summary: delete the trailer by SLUG
 *     security:
 *       - auth: []
 *     description:
 *       "Required roles: `admin`"
 *     tags:
 *       - trailer
 *     parameters:
 *     - in: path
 *       name: slug
 *       schema:
 *          type: string
 *       required: true
 *       description: slug of the trailer
 */

router.delete('/:trailer', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.trailer.author._id.toString() === req.payload.id.toString()){
      return req.trailer.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

// Favorite an trailer
router.post('/:trailer/favorite', auth.required, function(req, res, next) {
  var trailerId = req.trailer._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.favorite(trailerId).then(function(){
      return req.trailer.updateFavoriteCount().then(function(trailer){
        return res.json({trailer: trailer.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// Unfavorite an trailer
router.delete('/:trailer/favorite', auth.required, function(req, res, next) {
  var trailerId = req.trailer._id;

  User.findById(req.payload.id).then(function (user){
    if (!user) { return res.sendStatus(401); }

    return user.unfavorite(trailerId).then(function(){
      return req.trailer.updateFavoriteCount().then(function(trailer){
        return res.json({trailer: trailer.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// return an trailer's comments
router.get('/:trailer/comments', auth.optional, function(req, res, next){
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
    return req.trailer.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function(trailer) {
      return res.json({comments: req.trailer.comments.map(function(comment){
        return comment.toJSONFor(user);
      })});
    });
  }).catch(next);
});

// create a new comment
router.post('/:trailer/comments', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    var comment = new Comment(req.body.comment);
    comment.trailer = req.trailer;
    comment.author = user;

    return comment.save().then(function(){
      req.trailer.comments.push(comment);

      return req.trailer.save().then(function(trailer) {
        res.json({comment: comment.toJSONFor(user)});
      });
    });
  }).catch(next);
});

router.delete('/:trailer/comments/:comment', auth.required, function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
    req.trailer.comments.remove(req.comment._id);
    req.trailer.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
