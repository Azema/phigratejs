'use strict';

angular.module('phi.system')
.factory('phiBackdrop', [
  '$document',
  'phiAnimate',
function ($document, phiAnimate) {

  var el = angular.element('<div class="backdrop">');
  var backdropHolds = 0;

  $document[0].body.appendChild(el[0]);

  return {
    /**
     * @ngdoc method
     * @name $ionicBackdrop#retain
     * @description Retains the backdrop.
     */
    retain: retain,
    /**
     * @ngdoc method
     * @name $ionicBackdrop#retain
     * @description
     * Releases the backdrop.
     */
    release: release,
    // exposed for testing
    _element: el
  };

  function retain() {
    if ( (++backdropHolds) === 1 ) {
      el.addClass('visible');
      phiAnimate(function() {
        backdropHolds && el.addClass('active');
      });
    }
  }
  function release() {
    if ( (--backdropHolds) === 0 ) {
      el.removeClass('active');
      setTimeout(function() {
        !backdropHolds && el.removeClass('visible');
      }, 100);
    }
  }
}]);