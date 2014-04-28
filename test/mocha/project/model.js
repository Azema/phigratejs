'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Project = mongoose.model('Project');

//Globals
var project;

//The tests
describe('<Unit Test>', function() {
  describe('Model Project:', function() {
    beforeEach(function(done) {
      project = new Project({
        title: 'Project Title',
        config_path: '/path/to/config/file',
        section: 'test'
      });

      done();
    });

    describe('Properties', function() {
      it('should ba have createdAt and updatedAt properties', function() {
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
      project.remove();
      done();
    });
  });
});