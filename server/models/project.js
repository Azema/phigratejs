'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
  title: {
    type: String,
    default: '',
    trim: true
  },
  config_path: {
    type: String,
    default: '',
    trim: true
  },
  section: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
ProjectSchema.path('title').validate(function(title) {
  return title.length;
}, 'Title cannot be blank');
ProjectSchema.path('config_path').validate(function(config_path) {
  return config_path.length;
}, 'Config path cannot be blank');
ProjectSchema.path('section').validate(function(section) {
  return section.length;
}, 'Section cannot be blank');


/**
 * Statics
 */
ProjectSchema.statics.load = function(id, cb) {
  this.findOne({_id: id})
    .populate('user', 'name username')
    .exec(cb);
};

/**
 * Hooks
 */
ProjectSchema.pre('remove', function (next) {
  if (this.user) {
    mongoose.model('User').findByIdAndUpdate(this.user, {$pull: { projects: this._id }}, next);
  } else {
    next();
  }
});

// Add plugin timestamps
var timestamps = require('./plugins/timestamps');
ProjectSchema.plugin(timestamps);

module.exports = mongoose.model('Project', ProjectSchema);
