'use strict';

//Setting up route
angular.module('phi.auth').config(['$routeProvider', 'securityAuthorizationProvider',
  function ($routeProvider, securityAuthorizationProvider) {

    $routeProvider.when('/login', {
      templateUrl:'/public/auth/views/login.html',
      controller:'LoginCtrl',
    });

    $routeProvider.when('/register', {
      templateUrl:'/public/auth/views/register.html',
      controller:'RegisterCtrl'
    });
  }
]);
