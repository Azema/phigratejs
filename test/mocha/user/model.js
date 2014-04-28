'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Project = mongoose.model('Project');

//Globals
var user, user2;

//The tests
describe('<Unit Test>', function() {
  describe('Model User:', function() {
    // Remove all users from database
    before(function(done) {
      User.remove({}, done);
    });
    beforeEach(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password',
        provider: 'local'
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
      it('should have hasProject static method', function(done) {
        user.hasProject('5').should.be.false;
        var project = new Project({
          title: 'Project test',
          config_path: '/path/to/test',
          section: 'test'
        });
        user.projects.push(project);
        user.hasProject(project._id).should.be.true;
        project.remove();
        done();
      });
    });

    afterEach(function(done) {
      user.remove();
      user2.remove();
      done();
    });
  });
});
