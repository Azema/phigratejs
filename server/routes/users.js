'use strict';

// User routes use users controller
var users = require('../controllers/users');
var authorization = require('./middlewares/authorization');

module.exports = function(app, passport) {

  app.get('/logout', users.signout);
  app.get('/api/users', authorization.requiresAdmin, users.all);
  app.get('/api/users/me', users.me);

  // Setting up the users api
  app.post('/register', users.create);

  // AngularJS route to check for authentication
  app.get('/loggedin', function(req, res) {
    res.json(200, req.isAuthenticated() ? {user: {name: req.user.name, roles: req.user.roles}} : {user: null});
  });

  // Setting the local strategy route
  app.post('/login', passport.authenticate('local', {
    failureFlash: true
  }), function (req, res) {
    req.session.locale = req.user.locale;
    res.send({user: {name: req.user.name, roles: req.user.roles}});
  });
};
