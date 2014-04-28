'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    assert = require('assert'),
    mongoose = require('mongoose'),
    app = require(process.cwd() + '/server.js'),
    request = require('supertest'),
    User = mongoose.model('User'),
    Project = mongoose.model('Project');

//Globals
var user;
var project;

//The tests
describe('<Unit Test>', function() {
  describe('Controller Project:', function() {
    beforeEach(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      user.save(function() {
        Project.create({
          title: 'Project Title',
          config_path: '/path/to/config/file',
          section: 'test',
          user: user
        }, function(err, newProject) {
          project = newProject;
        });

        done();
      });
    });

    describe('GET /api/projects', function(){
      it('respond with json', function(done){
        request(app)
          .get('/api/projects')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) return done(err);
            console.log(res.body);
            done();
          });
      });
    });

    afterEach(function(done) {
      project.remove();
      user.remove();
      done();
    });
  });
});
