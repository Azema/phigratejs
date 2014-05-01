'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    _ = require('lodash'),
    path = require('path'),
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
      res.json(200, {status: true, result: project});
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

    project.save(function(err, newProject) {
      if (err) {
        var ret = checkErrors(err);
        return res.json(ret.code, ret.message);
      } else {
        res.json(200, {status: true, result: newProject});
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

exports.migration = function(req, res) {
  if (req.param('migrationId') === null) {
    return res.json(412, {message: 'migrationId is required'});
  }
  findProject(req.user, req.param('projectId'), function(err, project) {
    if (err) {
      console.log(err);
      return res.json(500, {message: err.errors});
    }
    migrations.getCodeMigration(project.config_path, project.section, req.param('migrationId'), function (err, code) {
      if (err) {
        return res.json(500, {message: err});
      }
      return res.send(code);
    });
  });
};

/**
 * Show an project
 */
exports.show = function(req, res) {
  findProject(req.user, req.param('projectId'), function(err, project) {
    if (err) {
      console.log(err);
      return res.json(500, {message: err});
    }
    migrations.getMigrations(project.config_path, project.section, function(err, migrations) {
      if (err) {
        console.log(err);
        return res.json(500, {message: err});
      }
      project = project.toJSON();
      project.migrations = migrations;
      res.json(200, {status: true, result: project});
    });
  });
};

/**
 * List of Projects
 */
exports.all = function(req, res) {
  Project.find({user: req.user})
    .sort('-created')
    .populate('user', 'username name')
    .exec(function(err, projects) {
      if (err) {
        console.log(err);
        res.json(500, {message: err});
      } else {
        var project, p = 0, projectsMigr = [], configDir;
        var cb_migrations = function(err, files) {
          if (err) {
            console.log(err);
            project.errors = err.message;
          } else {
            project.migrations = files;
          }
          projectsMigr.push(project);
          if (++p === projects.length) {
            res.json(200, {status: true, result: projectsMigr});
          }
        };
        var cb_app = function(err, objAppIni) {
          if (err) {
            project.errors = err;
          } else {
            configDir = path.dirname(project.config_path);
            migrations.getProjectMigrationFiles(configDir, objAppIni, project.section, cb_migrations);
          }
        };
        // Récupérer le nombre de migrations
        // Vérifer si les projets sont à jour
        for (var i = 0; i < projects.length; i++) {
          project = projects[i].toJSON();
          migrations.getApplicationIniObj(project.config_path, cb_app);
        }
      }
    });
};
