'use strict';

angular.module('phi.system')
	.controller('HeaderCtrl', [
		'$scope',
		'$rootScope',
		'$location',
		'$http',
		'security',
		'i18nNotifications',
		'phi.locale',
		'localizedMessages',
	  function ($scope, $rootScope, $location, $http, security, i18nNotifications, locale, localizedMessages) {

	  	$scope.user = security.getCurrentUser;
	  	$scope.isAuthenticated = security.isAuthenticated;

	    $scope.menus = [
				{
					title: localizedMessages.get('menu.title.projects.create'),
					link: '/projects/new',
					show: security.isAuthenticated
				}, {
					title: localizedMessages.get('menu.title.projects.list'),
					link: '/projects',
					show: security.isAuthenticated
				}
			];

			$scope.locales = [
				{key: 'en-gb', label: 'English'},
				{key: 'fr-fr', label: 'Français'}
			];
			$scope.form = {locale: locale};
			$scope.$watch('form.locale', function(newValue, oldValue) {
				if (newValue === oldValue) {
					return;
				}
				$http.get('/locale/' + newValue)
					.then(function(/*data*/) {
						window.location.reload();
					}, function(data) {
						i18nNotifications.pushForCurrentRoute(data.data.message, 'warning');
					});
			});

		  $scope.isActive = function (linkPath) {
		  	var path = $location.path().replace('/', '\/'), re = new RegExp('^' + path);
		    return re.test(linkPath);
		  };

		  $scope.logout = function() {
		  	security.logout('/');
		  };

		  $scope.login = function() {
		  	security.showLogin();
		  };

		  $scope.register = function() {
		  	security.showSignup();
		  };

		  $scope.refreshProjects = function() {
		  	$rootScope.$broadcast('refreshProjects');
		  };
	  }
	]);
