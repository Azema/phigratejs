'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

  app.get('/logout', users.signout);
  app.get('/users/me', users.me);

  // Setting up the users api
  app.post('/register', users.create);

  // Setting up the userId param
  app.param('userId', users.user);

  // AngularJS route to check for authentication
  app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user.name : '0');
  });

  // Setting the local strategy route
  app.post('/login', passport.authenticate('local', {
    failureFlash: true
  }), function (req,res) {
    res.json(req.user);
  });
};
