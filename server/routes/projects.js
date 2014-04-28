'use strict';

// Projects routes use projects controller
var projects = require('../controllers/projects');
var authorization = require('./middlewares/authorization');

// Project authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.hasProject(req.project.id)) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(app) {

  app.get('/api/projects', authorization.requiresLogin, projects.all);
  app.post('/api/projects', authorization.requiresLogin, projects.create);
  app.get('/api/projects/:projectId', authorization.requiresLogin, projects.show);
  app.put('/api/projects/:projectId', authorization.requiresLogin, hasAuthorization, projects.update);
  app.del('/api/projects/:projectId', authorization.requiresLogin, hasAuthorization, projects.destroy);

  // Finish with setting up the projectId param
  app.param('projectId', projects.project);

};