'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    consolidate = require('consolidate'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    config = require('./config'),
    expressValidator = require('express-validator'),
    appPath = process.cwd(),
    fs = require('fs'),
    assetmanager = require('assetmanager');

module.exports = function(app, passport, db) {

  // cache=memory or swig dies in NODE_ENV=production
  app.locals.cache = 'memory';

  // Setting the fav icon and static folder
  app.use(express.favicon(config.root + '/public/auth/assets/img/icons/favicon.ico'));
  // Should be placed before express.static
  // To ensure that all assets and data are compressed (utilize bandwidth)
  app.use('/public', express.compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
  }));
  app.use('/public', express.static(config.root + '/public'));
  app.use('/public', function(req, res) {
    res.send(404); // If we get here then the request for a static file is invalid
  });

  // Should be placed before express.static
  // To ensure that all assets and data are compressed (utilize bandwidth)
  app.use(express.compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
  }));

  // Only use logger for development environment
  if (process.env.NODE_ENV === 'development') {
		// Prettify HTML
		app.locals.pretty = true;
		app.set('showStackError', true);
    app.use(express.logger('dev'));
  }

	// assign the template engine to .html files
	app.engine('html', consolidate[config.templateEngine]);

  // set .html as the default extension
  app.set('view engine', 'html');

  // Set views path, template engine and default layout
  app.set('views', config.root + '/server/views');

  // Enable jsonp
  app.enable('jsonp callback');

  app.configure(function() {
    // The cookieParser should be above session
    app.use(express.cookieParser());

    // Request body parsing middleware should be above methodOverride
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(expressValidator());
    app.use(express.methodOverride());

    // Import your asset file
    var assets = require('./assets.json');
    assetmanager.init({
      js: assets.js,
      css: assets.css,
      debug: (process.env.NODE_ENV !== 'production'),
      webroot: 'public/'
    });
    // Add assets to local variables
    app.use(function(req, res, next) {
      res.locals({
        assets: assetmanager.assets
      });
      next();
    });

    var sessionConfig = {secret: config.sessionSecret};
    // Don't use mongoStore for test environment
    if (process.env.NODE_ENV !== 'test') {
      sessionConfig.store = new mongoStore({
        db: db.connection.db,
        collection: config.sessionCollection
      });
    }

    // Express/Mongo session storage
    app.use(express.session(sessionConfig));

    // Use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // Connect flash for flash messages
    app.use(flash());

    // Dynamic helpers
    app.use(helpers(config.app.name));

    // Routes should be at the last
    app.use(app.router);

    var routes_path = appPath + '/server/routes';
    var walk = function(path, done) {
      var files = fs.readdirSync(path),
          nbFiles = files.length;
      files.forEach(function (file, index) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
          if (/\.js$/.test(file)) {
            require(newPath)(app, passport);
          }
        // We skip the app/routes/middlewares directory as it is meant to be
        // used and shared by routes as further middlewares and is not a
        // route by itself
        } else if (stat.isDirectory() && file !== 'middlewares') {
          walk(newPath);
        }
        if (index === nbFiles-1) {
          done();
        }
      });
    };
    walk(routes_path, function() {
      app.all('/*', function (req, res) {
        res.render('index', {
          user: req.user ? JSON.stringify(req.user.name) : 'null',
          roles: req.user ? JSON.stringify(req.user.roles) : JSON.stringify(['annonymous'])
        });
      });
    });

  	// Assume "not found" in the error msgs is a 404. this is somewhat
  	// silly, but valid, you can do whatever you like, set properties,
  	// use instanceof etc.
  	app.use(function(err, req, res, next) {
  		// Treat as 404
  		if (~err.message.indexOf('not found')) return next();

  		// Log it
  		console.error(err.stack);

  		// Error page
  		res.status(500).render('500', {
  			error: err.stack
  		});
  	});

  	// Assume 404 since no middleware responded
  	app.use(function(req, res) {
  		res.status(404).render('404', {
  			url: req.originalUrl,
  			error: 'Not found'
  		});
  	});
  });
};
