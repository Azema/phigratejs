'use strict';

angular.module('phi.projects')
	.controller('ProjectsEditCtrl', [
		'$scope',
		'$location',
		'i18nNotifications',
		'Projects',
    'project',
		function ($scope, $location, i18nNotifications, Projects, project) {
			$scope.project = project;

	    $scope.onSave = function (project) {
	      i18nNotifications.pushForNextRoute('crud.projects.save.success', 'success', {title: project.title});
	      $location.path('/projects/show/' + project.$id());
	    };

	    $scope.onError = function() {
	      i18nNotifications.pushForCurrentRoute('crud.projects.save.error', 'danger');
	    };

	    $scope.onRemove = function(project) {
	      i18nNotifications.pushForNextRoute('crud.projects.remove.success', 'success', {title: project.title});
	      $location.path('/projects');
	    };
		}
	]);

/* vim: set ts=2 sw=2 sts=2 et ai: */