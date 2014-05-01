'use strict';

angular.module('phi.system')
.factory('phiAnimate', ['$window', '$rootScope', '$timeout', function ($window, $rootScope, $timeout) {

  var requestAnimationFrame = $window.requestAnimationFrame       ||
                              $window.webkitRequestAnimationFrame ||
                              function(fn) {
                                return $timeout(fn, 10, false);
                              };

  var cancelAnimationFrame = $window.cancelAnimationFrame       ||
                             $window.webkitCancelAnimationFrame ||
                             function(timer) {
                               return $timeout.cancel(timer);
                             };
  return function(fn) {
    var id = requestAnimationFrame(fn);
    return function() {
      cancelAnimationFrame(id);
    };
  };
}]);