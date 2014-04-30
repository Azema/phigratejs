'use strict';

/**
 * Module dependencies.
 */
var utils = require('../utils'),
    should = require('should'),
    assert = require('assert'),
    path = require('path'),
    migrations = require(process.cwd() + '/server/lib/migrations');


//The tests
describe('Migrations lib:', function() {

  // application.ini path
  var appIniPath = path.normalize(process.cwd() + '/test/mocha/fixtures/project/config/application.ini');

  describe('getProjectMigrationFiles', function () {

    it('should return error when config path is invalid', function (done) {
      var config_path = process.cwd() + '/application.ini';
      migrations.getProjectMigrationFiles(config_path, 'test', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('Application config file not found! (' + config_path + ')');
        done();
      });
    });

    it('should return error when section is invalid', function (done) {
      migrations.getProjectMigrationFiles(appIniPath, 'unknown', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('section (unknown) not found in application config !');
        done();
      });
    });

    it('should return error when migration dir is invalid', function (done) {
      var migrate_path = path.normalize(process.cwd() + '/test/mocha/fixtures/project/unknown');
      migrations.getProjectMigrationFiles(appIniPath, 'migrate_invalid', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('Migrations dir not found! (' + migrate_path + ')');
        done();
      });
    });

    it('should return error when migration dir absolute is invalid', function (done) {
      var migrate_path = path.normalize(process.cwd() + '/test/mocha/fixtures/project/unknown');
      migrations.getProjectMigrationFiles(appIniPath, 'migrate_absolute', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('Migrations dir not found! (/unknown)');
        done();
      });
    });

    it('should return error when migration dir does not exists', function (done) {
      migrations.getProjectMigrationFiles(appIniPath, 'no_migrate', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('migration.dir not found in config file!');
        done();
      });
    });

    it('should return migration list', function (done) {
      var migrate_path = path.normalize(process.cwd() + '/test/mocha/fixtures/project/migrate');
      migrations.getProjectMigrationFiles(appIniPath, 'test', function(err, results) {
        should.not.exist(err);
        results.should.be.type('object');
        results.should.have.properties(['dir', 'migrations']);
        results.dir.should.be.type('string');
        results.dir.should.be.equal(migrate_path);
        results.migrations.should.be.instanceof(Array);
        results.migrations.should.be.length(84);
        done();
      });
    });

  });

  describe('getApplicationIniObj', function () {

    it('should return application ini object', function (done) {
      migrations.getApplicationIniObj(appIniPath, function(err, appIniObj) {
        should.not.exist(err);
        appIniObj.should.be.type('object');
        appIniObj.should.have.property('default');
        appIniObj.default.should.have.property('migration');
        appIniObj.default.migration.dir.should.be.equal('../migrate');
        done();
      });
    });

    it('should return error when config path is invalid', function (done) {
      var config_path = process.cwd() + '/application.ini';
      migrations.getApplicationIniObj(config_path, function(err, appIniObj) {
        should.exist(err);
        should.not.exist(appIniObj);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('Application config file not found! (' + config_path + ')');
        done();
      });
    });

  });

  describe('getDbIniObj', function () {

    var dbIniPath = path.dirname(appIniPath) + '/database.ini';

    it('should return error when config path is invalid', function (done) {
      var config_path = process.cwd() + '/database.ini';
      migrations.getDbIniObj(config_path, function(err, appIniObj) {
        should.exist(err);
        should.not.exist(appIniObj);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('Database config file not found! (' + config_path + ')');
        done();
      });
    });

    it('should return db ini object', function (done) {
      migrations.getDbIniObj(dbIniPath, function(err, appIniObj) {
        should.not.exist(err);
        appIniObj.should.be.type('object');
        appIniObj.should.have.property('default');
        appIniObj.default.should.have.property('type');
        appIniObj.default.type.should.be.equal('mysql');
        done();
      });
    });

  });

  describe('getMigrationsFromDb', function () {

    var dbIniObj = {
      'default': {
        host: '127.0.0.1',
        user: 'test',
        password: 'test'
      },
      test: {
        socket: '/var/run/mysqld/mysqld.sock',
        host: '127.0.0.1',
        port: 3306,
        database: 'phigrate_test',
        user: 'phigrate',
        password: 'phigrate'
      },
      empty: {},
      bad_host: {
        host: '127.0.0.2',
        user: 'toto',
        password: 'toto'
      },
      bad_socket: {
        socket: '/mysqld.sock',
        user: 'toto',
        password: 'toto'
      },
      bad_port: {
        host: '127.0.0.1',
        port: 12,
        user: 'toto',
        password: 'toto'
      },
      bad_user: {
        host: '127.0.0.1',
        user: 'toto',
        password: 'toto'
      },
      bad_password: {
        host: '127.0.0.1',
        user: 'phigrate',
        password: 'toto'
      },
      no_database: {
        host: '127.0.0.1',
        user: 'phigrate',
        password: 'phigrate'
      }
    };

    it('should return error when no section found', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'no_section', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('section (no_section) not found in database config!');
        done();
      });
    });

    it('should return error when section is empty', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'empty', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('No data config found for connect to DB!');
        done();
      });
    });

    it('should return error with socket config invalid', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'bad_socket', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('connecting to DB: connect ENOENT');
        done();
      });
    });

    it('should return error with host config invalid', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'bad_host', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('connecting to DB: connect ECONNREFUSED');
        done();
      });
    });

    it('should return error with port config invalid', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'bad_port', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('connecting to DB: connect ECONNREFUSED');
        done();
      });
    });

    it('should return error with user config invalid', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'bad_user', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        var msg = 'connecting to DB: ER_ACCESS_DENIED_ERROR: Access denied for user \'' +
          dbIniObj.bad_user.user + '\'@\'localhost\' (using password: YES)';
        err.message.should.be.equal(msg);
        done();
      });
    });

    it('should return error with password config invalid', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'bad_password', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        var msg = 'connecting to DB: ER_ACCESS_DENIED_ERROR: Access denied for user \'' +
          dbIniObj.bad_password.user + '\'@\'localhost\' (using password: YES)';
        err.message.should.be.equal(msg);
        done();
      });
    });

    it('should return error with no database config', function (done) {
      migrations.getMigrationsFromDb(null, dbIniObj, 'no_database', function(err, results) {
        should.exist(err);
        should.not.exist(results);
        err.should.be.an.Error;
        err.should.have.property('message');
        err.message.should.be.equal('ER_NO_DB_ERROR: No database selected');
        done();
      });
    });

    it('should return versions from DB', function (done) {
      var versions = [
        '20120911072233',
        '20120911072234',
        '20120911072235'
      ],
          index = 0,
          EventEmitter = require('events').EventEmitter,
          eeQuery = new EventEmitter(),
          eeResults = new EventEmitter();

      var mockConnection = {
        connect: function(callback) { callback(); },
        query: function(sql) {
          sql.should.match(/schema_migrations/);
          eeQuery.emit('query');
          return eeResults;
        }
      };
      eeQuery.on('query', function() {
        process.nextTick(function() {
          var name = 'version';
          eeResults.emit('fields', [{name: name}]);
          var obj;
          for (var i = 0; i < versions.length; i++) {
            obj = {};
            obj[name] = versions[i];
            eeResults.emit('result', obj);
          }
          eeResults.emit('end');
        });
      });
      var dbObj = {
        test: {
          host: '127.0.0.1',
          port: 3306,
          database: 'phigrate_test',
          user: 'phigrate',
          password: 'phigrate'
        }
      }
      var mockDriver = {
        createConnection: function(options) {
          options.should.be.type('object');
          for (var k in options) {
            options[k].should.be.equal(dbObj.test[k]);
          }
          return mockConnection;
        }
      };
      migrations.getMigrationsFromDb(mockDriver, dbIniObj, 'no_database', function(err, results) {
        should.not.exist(err);
        should.exist(results);
        results.should.be.instanceof(Array);
        results.should.be.length(3);
        results.should.eql(versions);
        done();
      });
    });
  });

  describe('mergeMigrations', function() {

    var versions = ['20120911072233'];

    it('should add status 1 in existing migrate object', function (done) {
      // One migration found in DB
      var migrateObj_file_in_db = [{
        basename: '20120911072233_CreateTableUsers.php',
        name: 'Create Table Users',
        id: '20120911072233'
      }];
      var results = migrations.mergeMigrations(versions, migrateObj_file_in_db);
      should.exist(results);
      results.should.be.length(1);
      results[0].should.be.type('object');
      results[0].should.have.property('status');
      results[0].status.should.be.equal(1);
      done();
    });
    it('should add status 1 in existing migrate object and status 2 in others', function (done) {
      var moreVersions = ['20120911072233', '20121011072233']
      // One migration found in DB
      var migrateObj_file_in_db = [{
        basename: '20120911072233_CreateTableUsers.php',
        name: 'Create Table Users',
        id: '20120911072233'
      }];
      var results = migrations.mergeMigrations(moreVersions, migrateObj_file_in_db);
      should.exist(results);
      results.should.be.length(2);
      results[0].should.be.type('object');
      results[0].should.have.property('status');
      results[0].status.should.be.equal(1);
      results[1].should.have.properties(['basename', 'name', 'id', 'status']);
      results[1].basename.should.be.empty;
      results[1].name.should.be.empty;
      results[1].id.should.not.be.empty;
      results[1].status.should.be.equal(2);
      results[0].id.should.not.be.equal(results[1].id);
      results[1].id.should.be.equal(moreVersions[1]);
      done();
    });

    it('should add status 1 in first migrate object and status 0 in second', function (done) {
      // One migration found in DB and other one not found
      var migrateObj = [{
        basename: '20120911072233_CreateTableUsers.php',
        name: 'Create Table Users',
        id: '20120911072233'
      },{
        basename: '20140310105732_AddOneMigrationFileNotInDb.php',
        name: 'Add One Migration File Not In Db',
        id: '20140310105732'
      }];
      var results = migrations.mergeMigrations(versions, migrateObj);
      should.exist(results);
      results.should.be.length(2);
      results[0].should.be.type('object');
      results[0].should.have.property('status');
      results[0].status.should.be.equal(1);
      results[1].should.have.properties(['basename', 'name', 'id', 'status']);
      results[1].basename.should.not.be.empty;
      results[1].name.should.not.be.empty;
      results[1].id.should.not.be.empty;
      results[1].status.should.be.equal(0);
      results[0].id.should.not.be.equal(results[1].id);
      done();
    });

  });
});