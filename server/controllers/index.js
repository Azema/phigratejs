'use strict';

exports.render = function(req, res) {

	// Send some basic starting info to the view
	res.render('index', {
		user: req.user ? JSON.stringify(req.user.name) : 'null',
		roles: req.user ? JSON.stringify(req.user.roles) : JSON.stringify(['annonymous'])
	});
};
