'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    _ = require('lodash'),
    migrations = require('../lib/migrations');

/**
 * Check error type and return the code and message for the response
 *
 * @param {Object} err
 * @return {Object} {code, message}
 * @api private
 */
var checkErrors = function(err) {
  var ret = {code: 500, message: {errors: err.errors}};
  if (err.hasOwnProperty('name') && err.name === 'ValidationError') {
    var msg = {errors: {}};
    Object.keys(err.errors).forEach(function(path) {
      msg.errors[path] = err.errors[path].message;
    });
    ret.code = 412;
    ret.message = msg;
  }
  return ret;
};

var getProjectMigrations = function(req, project, done) {
  migrations.getMigrations(project.config_path, project.section, function(err, migrations) {
    if (err) {
      console.log(err);
      return done(err);
    }
    project = project.toJSON();
    project.migrations = migrations;
    if (!req.session.projects) {
      req.session.projects = {};
    }
    req.session.projects[project._id] = project;
    done(null, project);
  });
};

var deleteProjectInSession = function(req, projectId) {
  if (req.session.projects && req.session.projects[projectId]) {
    console.log('Before projects: ', Object.keys(req.session.projects));
    delete(req.session.projects[projectId]);
    console.log('After projects: ', Object.keys(req.session.projects));
  }
};

/**
 * Find project by id
 */
var findProject = function(user, id, next) {
  Project.findOne({_id: id, user: user}, function(err, project) {
    if (err) return next(err);
    if (!project) {
      return next(new Error('Failed to load project ' + id));
    }
    next(null, project);
  });
};

/**
 * Create an project
 */
exports.create = function(req, res) {
  var project = new Project(req.body);
  req.user.addProject(project, function(err) {
    if (err) {
      var ret = checkErrors(err);
      return res.json(ret.code, ret.message);
    } else {
      getProjectMigrations(req, project, function(err, projectWithMigrations) {
        if (err) {
          console.log(err);
          return res.json(500, {status: false, message: err.errors});
        }
        res.json(200, {status: true, result: projectWithMigrations});
      });
      }
  });
};

/**
 * Update an project
 */
exports.update = function(req, res) {
  findProject(req.user, req.param('projectId'), function(err, project) {
    if (err) {
      console.log(err);
      return res.json(500, {message: err});
    }

    project = _.extend(project, req.body);
    deleteProjectInSession(req, project._id);

    project.save(function(err, newProject) {
      if (err) {
        var ret = checkErrors(err);
        return res.json(ret.code, ret.message);
      } else {
        getProjectMigrations(req, newProject, function(err, projectWithMigrations) {
          if (err) {
            console.log(err);
            return res.json(500, {status: false, message: err.errors});
          }
          res.json(200, {status: true, result: projectWithMigrations});
        });
      }
    });
  });
};

/**
 * Delete an project
 */
exports.destroy = function(req, res) {
  findProject(req.user, req.param('projectId'), function(err, project) {
    if (err) {
      console.log(err);
      return res.json(500, {message: err});
    }
    var projectId = req.param('projectId');
    deleteProjectInSession(req, projectId);
    project.remove(function(err) {
      if (err) {
        var ret = checkErrors(err);
        return res.json(ret.code, ret.message);
      } else {
        res.status(204).send();
      }
    });
  });
};

var sendContentMigration = function(res, project, migrationId) {
  migrations.getContentMigration(project.migrations.directory, migrationId, function (err, code) {
    if (err) {
      return res.json(500, {message: err});
    }
    return res.send(code);
  });
};

exports.migration = function(req, res) {
  if (req.param('migrationId') === null) {
    return res.json(412, {message: 'migrationId is required'});
  }
  if (!req.param('refresh') && req.session.hasOwnProperty('projects') &&
    req.session.projects[req.param('projectId')])
  {
    sendContentMigration(res, req.session.projects[req.param('projectId')], req.param('migrationId'));
  } else {
    findProject(req.user, req.param('projectId'), function(err, project) {
      if (err) {
        console.log(err);
        return res.json(500, {message: err.errors});
      }
      getProjectMigrations(req, project, function(err, projectWithMigrations) {
        if (err) {
          console.log(err);
          return res.json(500, {status: false, message: err.errors});
        }
        sendContentMigration(res, projectWithMigrations, req.param('migrationId'));
      });
    });
  }
};

/**
 * Show an project
 */
exports.show = function(req, res) {
  if (!req.param('refresh') && req.session.hasOwnProperty('projects') &&
    req.session.projects[req.param('projectId')])
  {
    return res.json(200, {status: true, result: req.session.projects[req.param('projectId')]});
  } else {
    findProject(req.user, req.param('projectId'), function(err, project) {
      if (err) {
        console.log(err);
        return res.json(500, {message: err});
      }
      getProjectMigrations(req, project, function(err, projectWithMigrations) {
        if (err) {
          console.log(err);
          return res.json(500, {status: false, message: err.errors});
        }
        res.json(200, {status: true, result: projectWithMigrations});
      });
    });
  }
};

/**
 * List of Projects
 */
exports.all = function(req, res) {
  if (!req.session.projects) {
    req.session.projects = {};
  } else if (!req.param('refresh')) {
    console.log('projects: ', Object.keys(req.session.projects));
    return res.json(200, {status: true, result: req.session.projects});
  }
  Project.find({user: req.user})
    .sort('-created')
    .populate('user', 'username name')
    .exec(function(err, projects) {
      if (err) {
        console.log(err);
        res.json(500, {message: err});
      } else {
        var p = 0;
        var cb_migrations = function(err, projectWithMigrations) {
          if (err) {
            console.log(err);
            projectWithMigrations.errors = err.message;
          }
          if (++p === projects.length) {
            res.json(200, {status: true, result: req.session.projects});
          }
        };
        // Retrieve the projects migrations
        // Check if projects are up to date
        for (var i = 0; i < projects.length; i++) {
          getProjectMigrations(req, projects[i], cb_migrations);
        }
      }
    });
};
