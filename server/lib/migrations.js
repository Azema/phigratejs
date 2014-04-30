'use strict';

var mysql = require('mysql'),
    ini = require('ini-reader'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var MIGRATE_STATUS_NOT_IN_DB = 0;
var MIGRATE_STATUS_IN_DB = 1;
var MIGRATE_STATUS_NO_FILE = 2;

/**
 * Migrate class contains the properties of migration file
 *
 * @param {String} migrationFile - The migration path
 * @return {Migrate}
 * @api public
 */
var Migrate = function(migrationFile) {
  /**
   * The file base name
   * @api public
   */
  this.basename = '';
  /**
   * The human name
   * @api public
   */
  this.name = '';
  /**
   * The ID of migration file
   * @api public
   */
  this.id = '';
  /**
   * Migration status (0: not in db, 1: in db, 2: no file)
   * @api public
   */
  this.status = MIGRATE_STATUS_NOT_IN_DB;

  if (migrationFile) {
    this.basename = path.basename(migrationFile);
    this.name = this.basename.replace(/^\d+_(\w+)\.php$/i, '$1').replace(/([A-Z])/g, ' $1').trim();
    this.id = this.basename.replace(/^(\d+)_.*$/, '$1');
  }
};

/**
 * Retourne les numéros des fichiers de migrations correspondant au path et à la section fournies
 *
 * @param {String} configPath - Le chemin d'accès au fichiers de config du projet
 * @param {String} section     - Le nom de la section des fichiers INI à utiliser
 * @return {Object{}}
 * @api public
 */
module.exports.getProjectMigrationFiles = function(configPath, section, done) {
  // Récupération du fichier application.ini
  getApplicationIni(configPath, function(err, objAppIni) {
    if (err) {
      return done(err);
    }
    // Check presence of section
    if (!objAppIni.hasOwnProperty(section)) {
      return done(new Error('section (' + section + ') not found in application config !'));
    }
    if (!objAppIni[section].hasOwnProperty('migration')) {
      return done(new Error('migration.dir not found in config file!'));
    }
    var configDir = path.dirname(configPath);
    try {
      var migrationDir = normalizeMigrationDir(configDir, objAppIni[section].migration.dir);
    } catch (e) {
      return done(e);
    }
    walkDir(migrationDir, function(err, results) {
      if (err) {
        return done(err);
      }
      var migrations = {dir: migrationDir, migrations: results};
      migrations.migrations.sort(function(a, b) {
        return (a.id == b.id) ? 0 : (a.id < b.id) ? -1 : 1;
      });
      done(null, migrations);
    });
    // var databaseConfPath = objAppIni[section].database.config;
    // getDatabaseIni(configDir, databaseConfPath, function(err, objDbIni) {
    //   if (err) {
    //     return done(err);
    //   }
    // });
  });
};

/**
 * Return migration versions from DB
 *
 * @param {Object}   dbIniObj   - The db config INI object
 * @param {String}   section    - The section in db config object
 * @param {Function} done       - Callback
 * @api public
 */
var getMigrationsFromDb = function(driver, dbIniObj, section, done) {
  if (!dbIniObj.hasOwnProperty(section)) {
    return done(new Error('section (' + section + ') not found in database config!'));
  }

  getConnDb(driver, dbIniObj[section], function(err, conn) {
    if (err) {
      return done(err);
    }
    var versions = [],
        sql = 'SELECT version FROM schema_migrations ORDER BY version DESC',
        error = null, field,
        query = conn.query(sql);

    query
      .on('error', function(err) {
        error = err;
      })
      .on('fields', function(fields) {
        if (fields !== null && fields.length > 0 && fields[0].name !== null) {
          field = fields[0].name;
        }
      })
      .on('result', function(row) {
        if (field !== null) {
          versions.push(row[field]);
        }
      })
      .on('end', function() {
        if (error) {
          return done(error);
        }
        return done(null, versions);
      });
  });
};
module.exports.getMigrationsFromDb = getMigrationsFromDb;

/**
 * Merge migration objects with migration versions from DB
 *
 * @param {String{}}  versionsDb  - The migration versions From DB
 * @param {Migrate{}} migrateList - The Migrate object array
 * @return {Migrate{}}
 * @api public
 */
var mergeMigrations = function(versionsDb, migrateList) {
  var versRemaining = _.cloneDeep(versionsDb),
      index, migrateObj;
  for (var i = 0; i < migrateList.length; i++) {
    if ((index = versionsDb.indexOf(migrateList[i].id)) !== -1) {
      migrateList[i].status = MIGRATE_STATUS_IN_DB;
      versRemaining.splice(index, 1);
    } else {
      migrateList[i].status = MIGRATE_STATUS_NOT_IN_DB;
    }
  }
  for (var r = 0; r < versRemaining.length; r++) {
    migrateObj = new Migrate();
    migrateObj.id = versRemaining[r];
    migrateObj.status = MIGRATE_STATUS_NO_FILE;
    migrateList.push(migrateObj);
  }
  migrateList.sort(function(a, b) {
    return (a.id == b.id) ? 0 : (a.id < b.id) ? -1 : 1;
  });
  return migrateList;
};
module.exports.mergeMigrations = mergeMigrations;

/**
 * Create connection to DB
 *
 * @param {Object}   dbIniObj - The db config Ini object
 * @param {Function} done     - Callback (err, connection)
 * @api private
 */
var getConnDb = function(driver, dbIniObj, done) {
  var options = {};
  var optionsAllowed = ['host', 'port', 'user', 'password', 'database', 'socketPath'];
  Object.keys(dbIniObj).forEach(function(key) {
    if (optionsAllowed.indexOf(key) !== -1) {
      options[key] = dbIniObj[key];
    } else if (key === 'socket') {
      options.socketPath = dbIniObj[key];
    }
  });
  if (Object.keys(options).length <= 0) {
    return done(new Error('No data config found for connect to DB!'));
  }
  if (null === driver) {
    driver = mysql;
  }
  var connection = driver.createConnection(options);

  connection.connect(function(err) {
    if (err) {
      // console.error('error connecting: ' + err.stack);
      return done(new Error('connecting to DB: ' + err.message));
    }

    done(null, connection);
  });
};

/**
 * Return application INI object if found
 *
 * @param {String}   configPath - Directory path system of application.ini
 * @param {Function} done       - Callback (err, objIni)
 * @api public
 */
var getApplicationIni = function(configPath, done) {
  // Check if application config file exists
  if (!fs.existsSync(configPath)) {
    return done(new Error('Application config file not found! (' + configPath + ')'));
  }
  // Load and parse ini file
  ini.load(configPath, done);
};
module.exports.getApplicationIniObj = getApplicationIni;

/**
 * Return database INI object if found
 *
 * @param {String}   dbConfigPath - Value of database config dir ini define in application.ini
 * @param {Function} done         - Callback (err, objIni)
 * @api public
 */
var getDatabaseIni = function(dbConfigPath, done) {
  // Check if database config file exists
  if (!fs.existsSync(dbConfigPath)) {
    return done(new Error('Database config file not found! (' + dbConfigPath + ')'));
  }
  // Load and parse ini file
  ini.load(dbConfigPath, done);
};
module.exports.getDbIniObj = getDatabaseIni;

/**
 * Normalize path of migrations directory
 *
 * @param {String} configPath   - Directory path system of application.ini
 * @param {String} migrationDir - Value of migration dir define in application.ini
 * @api private
 */
var normalizeMigrationDir = function(configPath, migrationDir) {
  if (isRelativePath(migrationDir)) {
    migrationDir = path.normalize(configPath + '/' + migrationDir);
  }
  if (!fs.existsSync(migrationDir)) {
    throw new Error('Migrations dir not found! (' + migrationDir + ')');
  }
  return migrationDir;
};

/**
 * Check if path parameter is relative
 *
 * @param {String} pathDir - the path to check
 * @return {Boolean}
 * @api private
 */
var isRelativePath = function(pathDir) {
  if (/^\.\//.test(pathDir) || /^\.\.\//.test(pathDir)) {
    return true;
  }
  return false;
};

/**
 * Retrieve all files in dir and return Migrate array
 *
 * @param {String}   dir - Directory path
 * @param {Function} cb  - Callback
 * @api private
 */
var walkDir = function (dir, cb) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) { return cb(err); }

    var pending = list.length;

    if (!pending) { return cb(null, results); }

    list.forEach(function (file) {
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isFile()) {
          results.push(new Migrate(file));
        }

        if (!--pending) { cb(null, results); }
      });
    });
  });
};