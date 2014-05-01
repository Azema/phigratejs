'use strict';

angular.module('phi.auth.login', ['phi.system.localizedMessages', 'phi.auth.security'])
  .controller('LoginCtrl', ['$scope', 'security', 'localizedMessages', function($scope, security, localizedMessages) {
    // The model for this form
    $scope.user = {};

    // Any error message from failing to login
    $scope.authError = null;

    // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
    // We could do something diffent for each reason here but to keep it simple...
    $scope.authReason = null;
    if ( security.getLoginReason() ) {
      $scope.authReason = ( security.isAuthenticated() ) ?
        localizedMessages.get('login.reason.notAuthorized') :
        localizedMessages.get('login.reason.notAuthenticated');
    }

    // Attempt to authenticate the user specified in the form's model
    $scope.login = function() {
      // Clear any previous security errors
      $scope.authError = null;

      // Try to login
      security.login($scope.user.email, $scope.user.password)
        .then(function(loggedIn) {
          if ( !loggedIn ) {
            // If we get here then the login failed due to bad credentials
            $scope.authError = localizedMessages.get('login.error.invalidCredentials');
          }
        }, function(x) {
          // If we get here then there was a problem with the login request to the server
          $scope.authError = localizedMessages.get('login.error.serverError: ', { exception: x });
        });
    };

    $scope.clearForm = function() {
      $scope.user = {};
    };

    $scope.cancelLogin = function() {
      security.cancelLogin();
    };

    $scope.register = function() {
      security.showSignup();
    };
  }])
  .controller('RegisterCtrl', [
    '$scope','$rootScope','$http','$location', '$sce', 'security',
    function($scope, $rootScope, $http, $location, $sce, security) {
      $scope.user = {};

      $scope.trustMessage = function(message) {
        return $sce.trustAsHtml(message);
      };

      // Attempt to authenticate the user specified in the form's model
      $scope.register = function() {
        $scope.usernameError = null;
        $scope.registerError = null;
        // Clear any previous security errors
        $scope.authError = null;

        // Try to login
        security.register({
          email: $scope.user.email,
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword,
          username: $scope.user.username,
          name: $scope.user.fullname
        })
          .then(null, function(error) {
            // Error: authentication failed
            if (error === 'Username already taken') {
              $scope.usernameError = error;
            }
            else {
              $scope.registerError = error;
            }
          });
      };

      $scope.closeRegister = function() {
        security.cancelRegister();
      };

      $scope.login = function() {
        security.showLogin();
      };
    }
  ]);
