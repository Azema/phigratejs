'use strict';

angular.module('phi.projects')
  .controller('ProjectsShowCtrl', [
    '$scope',
    '$location',
    '$http',
    'i18nNotifications',
    'localizedMessages',
    'Projects',
    'project',
    function ($scope, $location, $http, i18nNotifications, localizedMessages, Projects, project) {
      $scope.project = project;
      $scope.collection = project.migrations.collection;

      $scope.$on('migrate', function(event) {
        event.preventDefault();
        $scope.refreshProject();
      });

      $scope.refreshProject = function() {
        //console.log($scope.project.$id());
        Projects.getById($scope.project.$id(), {refresh: true}, function(newProject) {
          if (newProject) {
            i18nNotifications.pushForCurrentRoute('crud.projects.refresh.success', 'success', {title: newProject.title});
            $scope.project = newProject;
            $scope.collection = newProject.migrations.collection;
          }
        }, function(message) {
          i18nNotifications.pushForCurrentRoute('crud.projects.refresh.error', 'danger', {title: $scope.project.title, message: message});
        });
      };
    }
  ]);
