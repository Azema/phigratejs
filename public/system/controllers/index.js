'use strict';

angular.module('phi.system')
  .controller('HomeCtrl', [
    '$scope',
    '$location',
    function ($scope, $location) {
      $scope.title = 'Phigrate.js';
    }
  ]);
