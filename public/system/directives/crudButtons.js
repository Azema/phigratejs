'use strict';

angular.module('phi.system.directives.crud')
  .directive('crudButtons', function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'system/views/directives/crud/crudButtons.tpl.html'
    };
  });

/* vim: set ts=2 sw=2 sts=2 et ai: */