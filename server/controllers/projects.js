'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    User = mongoose.model('User'),
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
  req.user.addProject(project, function(err, user) {
    if (err) {
      var ret = checkErrors(err);
      return res.json(ret.code, ret.message);
    } else {
      res.jsonp(project);
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
        res.jsonp(newProject);
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

/**
 * Show an project
 */
exports.show = function(req, res) {
  findProject(req.user, req.param('projectId'), function(err, project) {
    if (err) {
      console.log(err);
      return res.json(500, {message: err});
    }
    if (req.param('migrations')) {
      migrations.getProjectMigrationFiles(project.config_path, project.section, function(err, files) {
        if (err) {
          console.log(err);
          return res.json(500, {message: err});
        }
        project = project.toJSON();
        project.migrations = files;
        res.jsonp(project);
      });
    } else {
      res.jsonp(project);
    }
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
        res.jsonp(projects);
      }
    });
};
