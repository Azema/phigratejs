'use strict';

angular.module('phi.projects')
  .filter('keys', function() {
    return function(input) {
      if (!input) {
        return [];
      }
      return Object.keys(input).sort().reverse();
    };
  });