'use strict';

//Setting up route
angular.module('phi.projects')
  .config(['crudRouteProvider', 'securityAuthorizationProvider',
    function (crudRouteProvider, securityAuthorizationProvider) {

      crudRouteProvider.routesFor('Projects')
        .whenList({
          projects: ['Projects', function(Projects) { return Projects.all(); }]
        })
        .whenNew({
          currentUser: securityAuthorizationProvider.requireAuthenticatedUser,
          project: ['Projects', function(Projects) { return new Projects(); }]
        })
        .whenEdit({
          currentUser: securityAuthorizationProvider.requireAuthenticatedUser,
          project: ['$route', 'Projects', function($route, Projects) {
            return Projects.getById($route.current.params.itemId);
          }]
        })
        .whenShow({
          currentUser: securityAuthorizationProvider.requireAuthenticatedUser,
          project: ['$route', 'Projects', function($route, Projects) {
            return Projects.getById($route.current.params.itemId);
          }]
        });
    }
]);
