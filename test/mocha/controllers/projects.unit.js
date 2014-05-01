'use strict';

/**
 * Module dependencies.
 */
var utils = require('../utils'),
    should = require('should'),
    mongoose = require('mongoose'),
    supertest = require('supertest'),
    app = require(process.cwd() + '/server'),
    User = mongoose.model('User'),
    Project = mongoose.model('Project');


//The tests
describe('Controller Project:', function() {

  // Clean DB
  before(utils.before);

  //Globals
  var user, project,
      agent = supertest.agent(app);
  describe('User not logged in', function() {
    it('should return 401 when try to create project', function(done) {
      var data = {
        title: 'new project',
        config_path: '/path/to/new/project/config/',
        section: 'test'
      };
      agent
        .post('/api/projects')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });
    it('should return 401 when try to get project list', function(done){
      agent
        .get('/api/projects')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });
    it('should return 401 when try to get a project', function(done){
      agent
        .get('/api/projects/535e80d2ddca4a190d4830f7')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });
    it('should return 401 when try to update a project', function(done){
      agent
        .put('/api/projects/535e80d2ddca4a190d4830f7')
        .send({section: 'new_section'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });
    it('should return 401 when try to remove a project', function(done){
      agent
        .del('/api/projects/535e80d2ddca4a190d4830f7')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });
  });

  describe('User logged in', function() {

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

    beforeEach(function(done) {
      project = new Project({
        title: 'Project title',
        config_path: '/path/to/config/files',
        section: 'test'
      });
      user.addProject(project, done);
    });

    it('should return 200 when user create project', function(done) {
      var data = {
        title: 'new project',
        config_path: '/path/to/new/project/config/',
        section: 'test'
      };
      agent
        .post('/api/projects')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          if (err) return done(err);
          res.body.should.have.property('title');
          res.body.title.should.be.equal(data.title);
          res.body.should.have.property('section');
          res.body.section.should.be.equal(data.section);
          res.body.should.have.property('config_path');
          res.body.config_path.should.be.equal(data.config_path);
          res.body.should.have.property('user');
          res.body.user.should.be.equal(user._id.toString());
          Project.remove({_id: res.body._id}, done);
        });
    });
    it('should return 500 when user create a project invalid', function(done) {
      var data = {
        title: 'new project',
        config_path: '/path/to/new/project/config/'
      };
      agent
        .post('/api/projects')
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(412)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body.errors);
          should.exist(res.body.errors.section);
          res.body.errors.section.should.be.equal('Section cannot be blank');
          done();
        });
    });
    it('should return user\'s project list', function(done){
      agent
        .get('/api/projects')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          res.body.should.have.length(1);
          res.body[0].should.have.property('title');
          res.body[0].title.should.be.equal(project.title);
          done();
        });
    });
    it('should return project when get a project with id', function(done) {
      agent
        .get('/api/projects/' + project._id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('section');
          res.body.section.should.be.equal(project.section);
          done();
        });
    });
    it('should return project with migration files when get a project with id and migrations parameters', function(done) {
      project.config_path = process.cwd() + '/test/mocha/fixtures/project/config/application.ini';
      project.section = 'test';
      project.save(function(err) {
        should.not.exist(err);
        agent
          .get('/api/projects/' + project._id + '?migrations=true')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.should.have.property('section');
            res.body.section.should.be.equal(project.section);
            res.body.should.have.property('migrations');
            res.body.migrations.should.be.instanceof(Object);
            res.body.migrations.should.have.property('dir');
            res.body.migrations.should.have.property('migrations');
            res.body.migrations.migrations.should.be.instanceof(Array);
            res.body.migrations.migrations.should.not.empty;
            var migration = res.body.migrations.migrations[0];
            migration.should.be.type('object');
            migration.should.have.properties(['basename', 'name', 'id']);
            migration.basename.should.match(/^\d+_\w+\.php$/i);
            migration.name.should.match(/^(?:[A-Z]\w+\s?)+$/);
            migration.id.should.match(/^\d+$/);
            console.log(migration);
            done();
          });
      });
    });
    it('should return 401 when try to get another user project', function(done) {
      var otherProject = new Project({
        title: 'Another Project',
        config_path: '/path/to/antoher/config/files',
        section: 'another'
      });
      otherProject.save(function(err) {
        if (err) return done(err);
        agent
          .get('/api/projects/' + otherProject._id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.should.have.property('message');
            res.body.message.should.be.equal('User is not authorized');
            done();
          });
      });
    });
    it('should update project', function(done) {
      var data = {section: 'new_section', title: 'new_title'};
      agent
        .put('/api/projects/' + project._id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.should.have.property('section');
          res.body.section.should.be.equal(data.section);
          done();
        });
    });
    it('should return 412 when update project invalid', function(done) {
      var data = {section: '', title: 'new_title'};
      agent
        .put('/api/projects/' + project._id)
        .send(data)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(412)
        .end(function(err, res) {
          should.not.exist(err);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('section');
          res.body.errors.section.should.be.equal('Section cannot be blank');
          done();
        });
    });
    it('should return 401 when try to update another user project', function(done) {
      var otherProject = new Project({
        title: 'Another Project',
        config_path: '/path/to/antoher/config/files',
        section: 'another'
      });
      otherProject.save(function(err) {
        if (err) return done(err);
        var data = {section: 'new_section', title: 'new_title'};
        agent
          .put('/api/projects/' + otherProject._id)
          .send(data)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.should.have.property('message');
            res.body.message.should.be.equal('User is not authorized');
            done();
          });
      });
    });
    it('should remove project', function(done) {
      agent
        .del('/api/projects/' + project._id)
        .set('Accept', 'application/json')
        .expect(204)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.empty;
          done();
        });
    });
    it('should return 401 when try to remove another user project', function(done) {
      var otherProject = new Project({
        title: 'Another Project',
        config_path: '/path/to/antoher/config/files',
        section: 'another'
      });
      otherProject.save(function(err) {
        if (err) return done(err);
        agent
          .del('/api/projects/' + otherProject._id)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.should.have.property('message');
            res.body.message.should.be.equal('User is not authorized');
            done();
          });
      });
    });
    afterEach(function(done) {
      project.remove();
      done();
    });
    after(function(done) {
      user.remove();
      agent.get('/logout')
        .expect(302)
        .end(function(err, res) {
          if (err) return done(err);
          res.header.location.should.include('/');
          done();
        });
    });
  });
});
