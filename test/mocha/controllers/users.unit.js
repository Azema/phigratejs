'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    assert = require('assert'),
    mongoose = require('mongoose'),
    app = require(process.cwd() + '/server.js'),
    utils = require('../utils'),
    request = require('supertest'),
    User = mongoose.model('User'),
    Project = mongoose.model('Project');

//Globals
var user;
var project;

//The tests
describe('Controller Users:', function() {
  // Clean DB
  before(utils.before);

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
          should.exist(res.body.errors);
          should.exist(res.body.errors.email);
          res.body.errors.email.should.be.equal('You must enter a valid email address');
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
          should.exist(res.body.errors);
          should.exist(res.body.errors.password);
          res.body.errors.password.should.be.equal('Password must be between 8-20 characters long');
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
          should.exist(res.body.errors);
          should.exist(res.body.errors.confirmPassword);
          res.body.errors.confirmPassword.should.be.equal('Passwords do not match');
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
          should.exist(res.body.errors);
          should.exist(res.body.errors.username);
          res.body.errors.username.should.be.equal('Username cannot be more than 20 characters');
          done();
        });
    });
    it('should be able to show an error when try to register with username already exist', function(done){
       var user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password',
        provider: 'local',
        roles: ['authenticated']
      });
      user.save(function(err) {
        should.not.exist(err);
        request(app)
          .post('/register')
          .send({email: 'test@example.com', password: 'password', confirmPassword: 'password', username: 'user'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(412)
          .end(function(err, res) {
            should.not.exist(err);
            should.exist(res.body.errors);
            should.exist(res.body.errors.username);
            res.body.errors.username.should.be.equal('Username already taken');
            user.remove(done);
          });
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

    after(function (done) {
      User.remove();
      request(app).get('/logout').end(done);
    });
  });

  describe('User not logged in', function () {

    var agent = request.agent(app);

    before(function (done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });
      user.save(done);
    });

    it('should return 0 when get loggedin', function (done) {
      agent
        .get('/loggedin')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.should.not.empty;
          res.body.should.be.equal('0');
          done();
        });
    });

    it('should return error 401 when get all users', function (done) {
      agent
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.have.property('message');
          res.body.message.should.be.equal('User is not authorized');
          done();
        })
    });

    after(function (done) {
      if (user) {
        user.remove();
      }
      agent.get('/logout').end(done);
    });
  });

  describe('User logged in with role authenticated', function() {

    var agent = request.agent(app);

    before(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });
      user.save(function(err) {
        if (err) return done(err);
        agent.post('/login')
          .send({ email: user.email, password: user.password })
          .expect(200)
          .end(done);
      });
    });

    it('should return the profile of user', function (done) {
      agent
        .get('/api/users/me')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.should.not.empty;
          res.body.should.have.property('username');
          res.body.username.should.be.equal(user.username);
          res.body.should.have.property('name');
          res.body.name.should.be.equal(user.name);
          res.body.should.have.property('email');
          res.body.email.should.be.equal(user.email);
          res.body.should.have.not.property('password');
          res.body.should.have.not.property('hashed_password');
          res.body.should.have.not.property('salt');
          done();
        });
    });

    it('should return user name', function (done) {
      agent
        .get('/loggedin')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.should.not.empty;
          res.body.should.be.equal(user.name);
          done();
        });
    });

    it('should return error 401 when get all users', function (done) {
      agent
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res.body);
          res.body.should.have.property('message');
          res.body.message.should.be.equal('User is not authorized');
          done();
        })
    });

    it('should log out user', function (done) {
      agent
        .get('/logout')
        .expect(302)
        .end(function(err, res) {
          if (err) return done(err);
          res.header['location'].should.include('/');
          done();
        });
    });

    after(function(done) {
      user.remove();
      agent.get('/logout').end(done);
    });
  });

  describe('When user is admin', function () {

    var agent = request.agent(app);

    before(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password',
        roles: ['admin']
      });
      user.save(function(err) {
        if (err) return done(err);
        agent.post('/login')
          .send({ email: user.email, password: user.password })
          .expect(200)
          .end(done);
      });
    });

    it('should return users list', function (done) {
      var users = [];
      for (var i = 0; i < 10; i++) {
        users.push({
          name: 'Full name ' + i,
          email: 'test'+i+'@test.com',
          username: 'user'+i,
          password: 'password'
        });
      };
      User.create(users, function(err) {
        agent
          .get('/api/users')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);
            //console.log(res.body);
            res.body.should.be.instanceof(Array);
            res.body.should.be.length(11);
            done();
          });
      });
    });

    after(function(done) {
      User.remove();
      done();
    });
  });
});
