'use strict';

angular.module('wcb.system').controller('HeaderController', ['$scope', '$rootScope', 'Global',
    function($scope, $rootScope, Global) {
        $scope.global = Global;
        $scope.menus = [
			{
				'roles': ['authenticated'],
				'title': 'Articles',
				'link': 'all articles'
			}, {
				'roles': ['authenticated'],
				'title': 'Create New Article',
				'link': 'create article'
			}
		];
    }
]);
