'use strict';

// Projects service used for projects REST endpoint
angular.module('phi.projects')
.factory('Projects', ['phiResource', '$http', '$q', function (phiResource, $http, $q) {

  var ProjectResource = phiResource('projects');

  return ProjectResource;
}]);
