'use strict';

var fs = require('fs'),
    express = require('express'),
    appPath = process.cwd();

module.exports = function(passport, db) {

  var models_path = appPath + '/server/models', newPath, stat;
  var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
      newPath = path + '/' + file;
      stat = fs.statSync(newPath);
      if (stat.isFile()) {
        if (/.*\.js$/.test(file)) {
          require(newPath);
        }
      }
    });
  };
  walk(models_path);

  // Bootstrap passport config
  require(appPath + '/server/config/passport')(passport);

  // Express settings
  var app = express();
  require(appPath + '/server/config/express')(app, passport, db);

  return app;
};
