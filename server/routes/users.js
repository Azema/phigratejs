'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

  app.get('/logout', users.signout);
  app.get('/api/users/me', users.me);

  // Setting up the users api
  app.post('/register', users.create);

  // AngularJS route to check for authentication
  app.get('/loggedin', function(req, res) {
    res.json(200, req.isAuthenticated() ? req.user.name : '0');
  });

  // Setting the local strategy route
  app.post('/login', passport.authenticate('local', {
    failureFlash: true
  }), function (req, res) {
    return res.json(req.user);
  });
};
