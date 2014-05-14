'use strict';

angular.module('phi.projects')
  .directive('phiMigration', ['$rootScope', '$http', 'i18nNotifications', function ($rootScope, $http, i18nNotifications) {
    // Runs during compile
    return {
      // name: '',
      // priority: 1,
      // terminal: true,
      scope: {
        migration: '=phiMigration',
        project: '=',
        odd: '=',
        even: '='
      }, // {} = isolate, true = child, false/undefined = no change
      // controller: function($scope, $element, $attrs, $transclude) {},
      // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
      restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
      // template: '',
      templateUrl: 'projects/views/directives/migration.tpl.html',
      replace: true,
      // transclude: true,
      // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
      link: function($scope) {
        $scope.displayContent = false;

        $scope.migrate = function() {
          if ($scope.migration.status <= 1) {
            // UP
            $http.get('/api/projects/' + $scope.project.$id() + '/migrate/' + $scope.migration.id)
              .success(function(data) {
                if (data.code === 0) {
                  i18nNotifications.pushForCurrentRoute('crud.projects.migrate.success', 'success', {id: $scope.migration.id});
                  $scope.$emit('migrate');
                } else {
                  var stdout = data.stdout.replace(/\n/g, '<br/>');
                  var stderr = data.stderr.replace(/\n/g, '<br/>');
                  i18nNotifications.pushForCurrentRoute('crud.projects.migrate.error', 'warning', {message: stdout});
                }
              })
              .error(function(data) {
                i18nNotifications.pushForCurrentRoute('crud.projects.migrate.error', 'danger', data);
              });
          } else {
            i18nNotifications.pushForCurrentRoute('crud.projects.migrate.warning', 'warning');
          }
        };

        $scope.showCode = function() {
          if (!$scope.migration.hasOwnProperty('code') && $scope.migration.status <= 1) {
            $http.get('/api/projects/' + $scope.project.$id() + '/migration/' + $scope.migration.id)
              .success(function(data) {
                $scope.migration.code = data;
              })
              .error(function() {
                i18nNotifications.pushForCurrentRoute('crud.projects.show.migration.error', 'danger');
              });
            $scope.displayContent = !$scope.displayContent;
          } else if ($scope.migration.status <= 1) {
            $scope.displayContent = !$scope.displayContent;
          }
        };
      }
    };
  }]);