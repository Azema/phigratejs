'use strict';

angular.module('wcb.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}]);
