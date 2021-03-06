var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');



/**
 * @swagger
 * /users:
 *   get:
 *     summary: gets current user
 *     security:
 *       - auth: []
 *     description:
 *       "Required roles: `admin`"
 *     tags:
 *       - Users
 */

router.get('/users', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

/**
 * @swagger
 * /user:
 *   put:
 *     summary: changes the user
 *     description:
 *       "Required roles: `admin`"
 *     tags:
 *       - Users
 *     parameters:
 *       - name: user
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - username
 *             - email
 *             - bio
 *             - image
 *             - password
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             bio:
 *               type: string
 *             image:
 *               type:
 *             password:
 *               type: password
 *           example: {
 *             "username": "someUser",
 *             "email": "some@email",
 *             "bio": "some bio",
 *             "image": "someurl",
 *             "password": "somePassword"
 *           }
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *         examples:
 *           application/json: {
 *             "id": 1,
 *             "username": "someuser"
 *           }
 *       409:
 *         description: When the username is already in use
 */

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.bio !== 'undefined'){
      user.bio = req.body.user.bio;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Logs in a user
 *     description:
 *       "Required roles: `admin`"
 *     tags:
 *       - Users
 *     parameters:
 *       - name: user
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *           example: {
 *             "email": "some@email",
 *             "password": "somePassword"
 *           }
 *     responses:
 *       200:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *         examples:
 *           application/json: {
 *             "id": 1,
 *             "email": "some@user"
 *           }
 *       409:
 *         description: When the email is already in use
 */

router.post('/users/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});



/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *      - user
 *     summary: Create user TEST
 *     description: Add a new user
 *     operationId: createUser
 *     responses:
 *       default:
 *         description: successful operation
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *       description: Created user object
 *       required: true
 *   put:
 *     tags:
 *       - user
 *     summary: Update user
 *     description: Update an existing user
 *     operationId: updateUser
 *     security:
 *       - trailers_auth: []
 *     
 *       
 *     responses:
 *       '200':
 *         description: User logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     token:
 *                       type: string
 */
router.post('/users', function(req, res, next){
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

module.exports = router;
