var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');

var TrailerSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  location: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

TrailerSchema.plugin(uniqueValidator, {message: 'is already taken'});

TrailerSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }

  next();
});

TrailerSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

TrailerSchema.methods.updateFavoriteCount = function() {
  var trailer = this;

  return User.count({favorites: {$in: [trailer._id]}}).then(function(count){
    trailer.favoritesCount = count;

    return trailer.save();
  });
};

TrailerSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    location: this.location,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Trailer', TrailerSchema);
