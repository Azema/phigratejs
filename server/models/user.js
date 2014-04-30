'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    validator = require('validator');

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

// The 4 validations below only apply if you are signing up traditionally.
UserSchema.path('name').validate(function(name) {
  return (typeof name === 'string' && name.length > 0);
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
  return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');
UserSchema.path('email').validate(function(email) {
  return (typeof email === 'string' && email.length > 0 && validator.isEmail(email));
}, 'You must enter a valid email address');

UserSchema.path('username').validate(function(username) {
  return (typeof username === 'string' && username.length > 0);
}, 'Username cannot be blank');
UserSchema.path('username').validate(function(username) {
  return (typeof username === 'string' && username.length > 0 && username.length <= 20);
}, 'Username cannot be more than 20 characters');

UserSchema.path('hashed_password').validate(function(hashed_password) {
  return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
  if (this._password || this._confirmPassword) {
    if (typeof this._password !== 'string' || this._password.length < 8 || this._password.length > 20) {
      this.invalidate('password', 'Password must be between 8-20 characters long');
    }
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'required');
  }
}, null);

if (!UserSchema.options.hasOwnProperty('toJSON')) {
  UserSchema.options.toJSON = {};
}
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
   * addProject - add project in the user
   *
   * @param {Project} project
   * @return {User}
   * @api public
   */
  addProject: function(project, done) {
    project.user = this;
    var self = this;
    project.save(function(err, newProject) {
      if (err) {
        return done(err);
      }
      self.projects.push(newProject);
      self.save(done);
    });
  },
  /**
   * hasProject - check if the user has this project
   *
   * @param {mongoose.Schema.ObjectId} projectId
   * @return {Boolean}
   * @api public
   */
  hasProject: function(projectId) {
    if (projectId instanceof mongoose.Types.ObjectId) {
      projectId = projectId.toString();
    }
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
