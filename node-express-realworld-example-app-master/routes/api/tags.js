var router = require('express').Router();
var mongoose = require('mongoose');
var Trailer = mongoose.model('Trailer');

// return a list of tags
router.get('/', function(req, res, next) {
  Trailer.find().distinct('tagList').then(function(tags){
    return res.json({tags: tags});
  }).catch(next);
});

module.exports = router;
