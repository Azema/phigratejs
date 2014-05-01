'use strict';

angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	//if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	//angular.bootstrap(document, ['phi']);

});

// Default modules
var modules = [
  'ngRoute', 'ngLocale',
  'ui.bootstrap',
  'templates.app',
  'phi.i18n', 'phi.system', 'phi.auth', 'phi.projects'
];

// Combined modules
angular.module('phi', modules)
  .constant('phi.locale', window.locale || 'fr-fr')
  .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({redirectTo:'/'});
  }])
  .run(['security', function(security) {
    // Get the current user when the application starts
    // (in case they are still logged in from a previous session)
    security.requestCurrentUser();
  }]);
