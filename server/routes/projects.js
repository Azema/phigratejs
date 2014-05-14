'use strict';

// Projects routes use projects controller
var projects = require('../controllers/projects');
var authorization = require('./middlewares/authorization');

// Project authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.param('projectId') || !req.user.hasProject(req.param('projectId'))) {
    return res.json(401, {message: 'User is not authorized'});
  }
  next();
};

module.exports = function(app) {

  app.get('/api/projects', authorization.requiresLogin, projects.all);
  app.post('/api/projects', authorization.requiresLogin, projects.create);
  app.get('/api/projects/checkConfig', authorization.requiresLogin, projects.checkConfig);
  app.get('/api/projects/:projectId', authorization.requiresLogin, hasAuthorization, projects.show);
  app.get('/api/projects/:projectId/migration/:migrationId', authorization.requiresLogin, hasAuthorization, projects.migration);
  app.get('/api/projects/:projectId/migrate/:migrationId', authorization.requiresLogin, hasAuthorization, projects.migrate);
  app.put('/api/projects/:projectId', authorization.requiresLogin, hasAuthorization, projects.update);
  app.del('/api/projects/:projectId', authorization.requiresLogin, hasAuthorization, projects.destroy);

};