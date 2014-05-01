'use strict';

angular.module('phi.system.crud', ['phi.system.crudRouteProvider'])
  .factory('crudListMethods', ['$location', function ($location) {

    return function (pathPrefix) {

      var mixin = {};

      mixin['new'] = function () {
        $location.path(pathPrefix+'/new');
      };

      mixin['edit'] = function (itemId) {
        $location.path(pathPrefix + '/edit/' + itemId);
      };

      mixin['show'] = function (itemId) {
        $location.path(pathPrefix + '/show/' + itemId);
      };

      return mixin;
    };

  }]);

/* vim: set ts=2 sw=2 sts=2 et ai: */
