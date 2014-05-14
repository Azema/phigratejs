'use strict';

angular.module('phi.system')
  .controller('AppCtrl', [
    '$scope',
    '$rootScope',
    '$http',
    'security',
    'i18nNotifications',
    'I18N.MESSAGES',
    'localizedMessages',
    'phiLoading',
    function ($scope, $rootScope, $http, security, i18nNotifications, i18nMessages, localizedMessages, phiLoading) {

      $scope.notifications = i18nNotifications;
      $scope.user = security.getCurrentUser;
      $scope.isAuthenticated = security.isAuthenticated;
      var keys = Object.keys(i18nMessages);
      var messages = {};
      angular.forEach(keys, function(key) {
        messages[key] = localizedMessages.get(key);
      });
      $rootScope.messages = messages;
      $rootScope.width = angular.element(document).width();

      $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
      });
      var templateLoading = '<div class="loading"><img src="/public/system/assets/img/loaders/Preloader_3.gif" alt="loading" title="loading"/></div>';
      phiLoading.setOptions({template: templateLoading});

      $rootScope.$on('phiLoading:show', function(event) {
        event.preventDefault();
        phiLoading.show();
      });
      $rootScope.$on('phiLoading:hide', function(event) {
        event.preventDefault();
        phiLoading.hide();
      });
    }
  ]);