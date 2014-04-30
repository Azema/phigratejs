'use strict';

/*
 * Modified from https://github.com/elliotf/mocha-mongoose
 */

var config = require(process.cwd() + '/server/config/config');
var mongoose = require('mongoose');

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

var db = null;

function clearCollections(done) {
  db.collections(function (err, collections) {
    if (err) {
      console.log(err);
      return done(err);
    }

    var todo = collections.length;
    if (!todo) return done();

    collections.forEach(function(collection){
      if (collection.collectionName.match(/^system\./)) return --todo;

      collection.remove({},{safe: true}, function(){
        if (--todo === 0) done();
      });
    });
  });
}

function reconnect(done) {
  mongoose.connect(config.db, function (err) {
    if (err) {
      console.log(err);
      return done(err);
    }
    clearDB(done);
  });
}

function clearDB(done) {
  if (db) {
    return clearCollections(done);
  } else {
    // Connection state opened
    if (mongoose.connection.readyState === 1) {
      db = mongoose.connection.db;
      return clearCollections(done);
    }
    // Connection state openning
    else if (mongoose.connection.readyState === 2) {
      mongoose.connection.on('open', function() {
        db = mongoose.connection.db;
        clearDB(done);
      });
    }
    // Connection state unknown, try to reconnect
    else {
      reconnect(done);
    }
  }
}

module.exports.before = function(done) {
  clearDB(done);
};
module.exports.after = function(done) {
  mongoose.disconnect(done);
};
