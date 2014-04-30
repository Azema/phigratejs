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
describe('Model User:', function() {
  //Globals
  var user, user2;

  // Remove all users from database
  before(utils.before);

  beforeEach(function(done) {
    user = new User({
      name: 'Full name',
      email: 'test@test.com',
      username: 'user',
      password: 'password',
      provider: 'local',
      roles: ['authenticated']
    });
    user2 = new User(user);

    done();
  });

  describe('Find', function() {
    it('should begin without users', function(done) {
      User.find({ email: 'test@test.com' }, function(err, users) {
        should.not.exist(err);
        users.should.instanceof(Array);
        users.should.have.length(0);
        done();
      });
    });
  });

  describe('Properties', function() {
    it('should has createdAt and updatedAt properties', function() {
      user.save(function(err) {
        should.not.exist(err);
        user.should.have.property('createdAt');
        user.createdAt.should.instanceof(Date);
        user.should.have.property('updatedAt');
        user.updatedAt.should.instanceof(Date);
      });
    });
  });

  describe('Method Save', function() {

    it('should be able to save without problems', function(done) {
      user.save(done);
    });

    it('should fail to save an existing user again', function(done) {
      user.save();
      return user2.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should show an error when try to save without name', function(done) {
      user.name = '';
      return user.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('Custom Methods', function() {
    var project;
    it('should add project method and add user ref in project', function(done) {
      project = new Project({
        title: 'Project test',
        config_path: '/path/to/test',
        section: 'test'
      });
      should.not.exist(project.user);
      user.addProject(project, function(err, newUser) {
        should.exist(project.user);
        project.user.should.be.equal(newUser._id);
        done();
      });
    });
    it('should have hasProject method', function(done) {
      user.hasProject('5').should.be.false;
      project = new Project({
        title: 'Project test',
        config_path: '/path/to/test',
        section: 'test'
      });
      user.addProject(project, function(err, newUser) {
        newUser.hasProject(project._id).should.be.true;
        done();
      });
    });
    it('should return empty string if call encryptPassword wihtout parameter', function (done) {
      user.encryptPassword().should.be.empty;
      done();
    });
    it('should return empty string if call encryptPassword wiht null salt', function (done) {
      user.salt = null;
      user.encryptPassword().should.be.empty;
      done();
    });
    it('should return error if call addProject with project invalid', function (done) {
      project = new Project({
        title: 'Project test',
        config_path: '/path/to/test'
      });
      user.addProject(project, function(err) {
        should.exist(err);
        done();
      });
    });
    it('should check presence of the role passed in parameter in the user\'s roles', function (done) {
      user.hasRole('unknown').should.be.false;
      user.hasRole('authenticated').should.be.true;
      done();
    });
    it('should check presence of the role "admin" in the user\'s roles', function (done) {
      user.hasRole('unknown').should.be.false;
      user.hasRole('authenticated').should.be.true;
      user.roles.push('admin');
      user.hasRole('unknown').should.be.true;
      done();
    });
    it('should check if user is "admin"', function (done) {
      user.isAdmin().should.be.false;
      user.roles.push('admin');
      user.isAdmin().should.be.true;
      done();
    });
    afterEach(function(done) {
      if (project) {
        project.remove();
      }
      done();
    });
  });

  afterEach(function(done) {
    if (user) {
      user.remove();
    }
    if (user2) {
      user2.remove();
    }
    done();
  });
});
