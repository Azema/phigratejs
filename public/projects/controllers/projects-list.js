'use strict';

angular.module('phi.projects')
  .controller('ProjectsListCtrl', [
    '$scope',
    '$location',
    'crudListMethods',
    'i18nNotifications',
    'Projects',
    'projects',
    function ($scope, $location, crudListMethods, i18nNotifications, Projects, projects) {
      angular.extend($scope, crudListMethods('/projects'));

      $scope.projects = projects;

      $scope.remove = function(project, $index, $event) {
        // Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
        // an edit of this item.
        $event.preventDefault();

        // Remove this project
        project.$remove(function() {
          // It is gone from the DB so we can remove it from the local list too
          $scope.projects.splice($index,1);
          i18nNotifications.pushForCurrentRoute('crud.project.remove.success', 'success', {title: project.title});
        }, function() {
          i18nNotifications.pushForCurrentRoute('crud.project.remove.error', 'danger', {title: project.title});
        });
      };
    }
  ]);