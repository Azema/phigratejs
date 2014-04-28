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
  describe('Controller Users:', function() {
    describe('POST /register', function() {
      it('should be able to show an error when try to register with wrong email', function(done){
        request(app)
          .post('/register')
          .send({email: 'test', password: 'password', confirmPassword: 'password', username: 'test'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(412)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.should.be.length(1);
            res.body[0].param.should.be.equal('email');
            res.body[0].msg.should.be.equal('You must enter a valid email address');
            done();
          });
      });
      it('should be able to show an error when try to register with password too short', function(done){
        request(app)
          .post('/register')
          .send({email: 'test@example.com', password: 'pa', confirmPassword: 'pa', username: 'test'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(412)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.should.be.length(1);
            res.body[0].param.should.be.equal('password');
            res.body[0].msg.should.be.equal('Password must be between 8-20 characters long');
            done();
          });
      });
      it('should be able to show an error when try to register with not same passwords', function(done){
        request(app)
          .post('/register')
          .send({email: 'test@example.com', password: 'password', confirmPassword: 'notsame', username: 'test'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(412)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.should.be.length(1);
            res.body[0].param.should.be.equal('confirmPassword');
            res.body[0].msg.should.be.equal('Passwords do not match');
            done();
          });
      });
      it('should be able to show an error when try to register with username too long', function(done){
        request(app)
          .post('/register')
          .send({email: 'test@example.com', password: 'password', confirmPassword: 'password', username: 'testusernameverytoolong'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(412)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Array);
            res.body.should.be.length(1);
            res.body[0].param.should.be.equal('username');
            res.body[0].msg.should.be.equal('Username cannot be more than 20 characters');
            done();
          });
      });
      it('should be able to register without problem', function (done) {
        var data = {email: 'test@example.com', password: 'password', confirmPassword: 'password', username: 'test'};
        request(app)
          .post('/register')
          .send(data)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.be.instanceof(Object);
            res.body.username.should.be.equal(data.username);
            res.body.email.should.be.equal(data.email);
            should.not.exist(res.body.password);
            should.not.exist(res.body.confirmPassword);
            should.not.exist(res.body.hashed_password);
            should.not.exist(res.body.salt);
            User.remove(done);
          });
      });
    });
  });
});
