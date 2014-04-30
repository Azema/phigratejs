'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    app = require(process.cwd() + '/server'),
    utils = require('../utils'),
    User = mongoose.model('User'),
    Project = mongoose.model('Project');


//The tests
describe('Model Project:', function() {

  //Globals
  var project, user;

  before(utils.before);

  beforeEach(function(done) {
    project = new Project({
      title: 'Project Title',
      config_path: '/path/to/config/file',
      section: 'test'
    });
    project.save(done);
  });

  describe('Custom remove method', function() {

    beforeEach(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@example.com',
        username: 'test',
        password: 'password',
        provider: 'local'
      });
      done();
    });

    it('should set user id when add project to user', function(done) {
      should.not.exist(project.user);
      user.addProject(project, function(err) {
        if (err) return done(err);
        should.exist(project.user);
        project.user.should.be.equal(user._id);
        done();
      });
    });

    it('should remove project from user when remove the project', function(done) {
      should.not.exist(project.user);
      user.addProject(project, function(err) {
        if (err) return done(err);
        should.exist(project.user);
        user.hasProject(project._id).should.be.true;
        project.remove(function(err) {
          if (err) { return done(err); }
          User.findOne({_id: user._id}, function(err, userUpdated) {
            userUpdated.hasProject(project._id).should.be.false;
            done();
          });
        });
      });
    });

    afterEach(function (done) {
      if (user) user.remove();
      done();
    });
  });

  describe('Properties', function() {
    it('should have createdAt and updatedAt properties', function() {
      project.save(function(err) {
        should.not.exist(err);
        project.should.have.property('createdAt');
        project.createdAt.should.instanceof(Date);
        project.should.have.property('updatedAt');
        project.updatedAt.should.instanceof(Date);
      });
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      return project.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function(done) {
      project.title = '';

      return project.save(function(err) {
        should.exist(err);
        err.should.have.property('message');
        err.message.should.equal('Validation failed');
        err.should.have.property('errors');
        err.errors.should.have.property('title');
        err.errors.title.message.should.equal('Title cannot be blank');
        done();
      });
    });

    it('should be able to show an error when try to save without config path', function(done) {
      project.config_path = '';

      return project.save(function(err) {
        should.exist(err);
        err.should.have.property('message');
        err.message.should.equal('Validation failed');
        err.should.have.property('errors');
        err.errors.should.have.property('config_path');
        err.errors.config_path.message.should.equal('Config path cannot be blank');
        done();
      });
    });

    it('should be able to show an error when try to save without section', function(done) {
      project.section = '';

      return project.save(function(err) {
        should.exist(err);
        err.should.have.property('message');
        err.message.should.equal('Validation failed');
        err.should.have.property('errors');
        err.errors.should.have.property('section');
        err.errors.section.message.should.equal('Section cannot be blank');
        done();
      });
    });
  });

  describe('Methods static', function() {
    it('should have load static method', function(done) {
      project.save(function(err) {
        should.not.exist(err);
        Project.load(project._id, function(err, aProject) {
          should.not.exist(err);
          aProject.should.instanceof(Project);
          done();
        });
      });
    });
  });

  afterEach(function(done) {
    if (project) {
      project.remove();
    }
    if (user) {
      user.remove();
    }
    done();
  });
});
