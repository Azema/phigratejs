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

      $scope.isUpToDate = function() {
        if (angular.isDefined($scope.upToDate)) {
          return $scope.upToDate;
        }
        var upToDate = true;
        for (var i = 0; i < project.migrations.migrations.length; i++) {
          if (project.migrations.migrations[i].status !== 1) {
            upToDate = false;
            break;
          }
        }
        console.log('upToDate: ' + upToDate);
        $scope.upToDate = upToDate;
        return upToDate;
      };
      $scope.showCode = function(migration) {
        if (!migration.hasOwnProperty('code')) {
          $http.get('/api/projects/'+$scope.project.$id()+'/migration/'+migration.id)
            .success(function(data) {
              migration.code = data;
            })
            .error(function() {
              i18nNotifications.pushForCurrentRoute('crud.projects.show.migration.error', 'danger');
            });
        }
      };
    }
  ]);
