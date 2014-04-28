'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * User Schema
 */
 var UserSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    index: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    trim: true
  },
  roles: [{
    type: String,
    default: 'authenticated'
  }],
  hashed_password: String,
  salt: String,
  projects: [{
    type: Schema.ObjectId,
    ref: 'Project',
    index: true
  }]
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.encryptPassword(password);
}).get(function() {
  return this._password;
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
  return value && value.length;
};

// The 4 validations below only apply if you are signing up traditionally.
UserSchema.path('name').validate(function(name) {
  return (typeof name === 'string' && name.length > 0);
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
  return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
  return (typeof username === 'string' && username.length > 0);
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
  return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password))
    next(new Error('Invalid password'));
  else
    next();
});

if (!UserSchema.options.toJSON) UserSchema.options.toJSON = {};
UserSchema.options.toJSON.transform = function (doc, ret, options) {
  // remove the _id of every document before returning the result
  delete ret.salt;
  delete ret.hashed_password;
};

/**
 * Methods
 */
UserSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole: function(role) {
    var roles = this.roles;
    return (roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1);
  },
  /**
   * isAdmin - check if the user is admin
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin: function() {
    return this.roles.indexOf('admin') !== -1;
  },
  /**
   * hasProject - check if the user has this project
   *
   * @param {mongoose.Schema.ObjectId} projectId
   * @return {Boolean}
   * @api public
   */
  hasProject: function(projectId) {
    for (var i = 0; i < this.projects.length; i++) {
      if (projectId == this.projects[i]) {
        return true;
      }
    }
    return false;
  },
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

// Add plugin timestamps
var timestamps = require('./plugins/timestamps');
UserSchema.plugin(timestamps);

mongoose.model('User', UserSchema, 'users');
