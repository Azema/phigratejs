'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res) {

  // Check password fields are equals
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  if (req.validationErrors()) {
    return res.json(412, {errors: {confirmPassword: 'Passwords do not match'}});
  }
  var user = new User(req.body);

  // Hard coded for now. Will address this with the user permissions system in v0.3.5
  user.roles = ['authenticated'];
  user.save(function(err) {
    if (err) {
      var msg = {errors: {}};
      if (err.name && err.name === 'ValidationError') {
        Object.keys(err.errors).forEach(function(path) {
          msg.errors[path] = err.errors[path].message;
        });
      } else {
        switch (err.code) {
          case 11000:
          case 11001:
            msg.errors.username = 'Username already taken';
            break;
          default:
            msg.errors.user = 'Please fill all the required fields';
        }
      }

      return res.json(412, msg);
    }
    req.logIn(user, function(err) {
      if (err) return res.json(500, err.errors);
      return res.json(200, user);
    });
  });
};
/**
 * Send User
 */
exports.me = function(req, res) {
  res.jsonp(req.user || null);
};

exports.all = function(req, res) {
  User.find()
    .sort('-created')
    .exec(function(err, users) {
      if (err) {
        return res.json(500, {message: err.errors});
      }
      res.json(200, users);
    });
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User.findOne({_id: id}, '-salt -hashed_password')
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};