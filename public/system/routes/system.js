'use strict';

//Setting up route
angular.module('phi.system').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider.when('/', {
      templateUrl:'system/views/index.tpl.html',
      controller:'HomeCtrl'
      // resolve: {
      //   matches: ['Matches', function(Matches) {
      //     var now = new Date(Date.now());
      //     var criteria = {
      //       date: {$gt: now}
      //     };
      //     return Matches.query({limit: 5,sort: 'date', query: JSON.stringify(criteria)});
      //   }],
      //   users: ['$http', 'i18nNotifications', function($http, i18nNotifications) {
      //     var url = '/api/users?limit=5&sort=created';
      //     return $http.get(url).then(function(data, status) {
      //       return data.data;
      //     }, function(data) {
      //       i18nNotifications.pushForNextRoute('error.global', 'warning', data.data);
      //     });
      //   }],
      //   bets: ['Bets', function(Bets) {
      //     return Bets.query({limit: 5,sort: '-created'});
      //   }]
      // }
    });
  }
]);