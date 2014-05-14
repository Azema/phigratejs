'use strict';

angular.module('phi.system.directives.phiNotification', ['phi.system.i18nNotifications'])

/**
 * A validation directive to ensure that the model contains a unique email address
 * @param  Users service to provide access to the server's user database
  */
.directive('phiNotification', ['$timeout', 'i18nNotifications', function ($timeout, i18nNotifications) {
  return {
    //require:'ngModel',
    restrict:'A',
    replace: true,
    scope: {
      item: '=phiNotification'
    },
    template: '<div data-ng-class="[\'alert\', \'alert-\'+item.type]">' +
      '<button class="close" data-ng-click="removeNotification(item)">x</button>' +
      '<span data-ng-bind-html="item.message"></span></div>',
    link: function (scope, el) {
      if (scope.item.type === 'success') {
        $timeout(function(){
            el.fadeOut(function() {
              scope.removeNotification(scope.item);
            });
         }, 5000);
      }

      scope.removeNotification = function(notification) {
        i18nNotifications.remove(notification);
      };
    }
  };
}]);

/* vim: set ts=2 sw=2 sts=2 et ai: */
