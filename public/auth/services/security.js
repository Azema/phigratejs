'use strict';

// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('phi.auth.security.service', [
  'phi.auth.security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'phi.auth.login',         // Contains the login form template and controller
  'ui.bootstrap.modal'     // Used to display the login form as a modal dialog.
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$modal', function ($http, $q, $location, queue, $modal) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    if (null !== url) {
      $location.path(url);
    }
  }

  // Login form dialog stuff
  var loginDialog = null;
  var registerDialog = null;
  function openLoginDialog() {
    if (registerDialog) {
      closeRegisterDialog(false);
    }
    if ( loginDialog ) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    loginDialog = $modal.open(
      {
        templateUrl: '/public/auth/views/login.html',
        controller: 'LoginCtrl'
      }
    );
    loginDialog.result.then(onLoginDialogClose);
  }
  function closeLoginDialog(success) {
    if (loginDialog) {
      loginDialog.close(success);
    }
  }
  function onLoginDialogClose(success) {
    loginDialog = null;
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
      //redirect();
    }
  }
  function openRegisterDialog() {
    if (loginDialog) {
      closeLoginDialog(false);
    }
    if ( registerDialog ) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    registerDialog = $modal.open(
      {
        templateUrl: '/public/auth/views/register.html',
        controller: 'RegisterCtrl'
      }
    );
    registerDialog.result.then(onRegisterDialogClose);
  }
  function closeRegisterDialog(success) {
    if (registerDialog) {
      registerDialog.close(success);
    }
  }
  function onRegisterDialogClose(success) {
    registerDialog = null;
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
    }
  }

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function() {
      openLoginDialog();
    },

    // open page for sign up
    showSignup: function() {
      openRegisterDialog();
    },

    // Attempt to authenticate a user by the given email and password
    login: function(email, password) {
      var request = $http.post('/login', {email: email, password: password});
      return request.then(function(response) {
        service.currentUser = response.data.user;
        if ( service.isAuthenticated()) {
          closeLoginDialog(true);
        }
        // redirect();
        return service.isAuthenticated();
      });
    },

    // Attempt to register a user
    register: function(data) {
      var request = $http.post('/register', data);
      return request.then(function() {
        return service.requestCurrentUser().then(function() {
          closeRegisterDialog(true);
          return service.isAuthenticated();
        });
      });
    },

    // Give up trying to register and clear the retry queue
    cancelRegister: function() {
      closeRegisterDialog(false);
    },

    // Give up trying to login and clear the retry queue
    cancelLogin: function() {
      closeLoginDialog(false);
    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      $http.get('/logout').then(function() {
        service.currentUser = null;
        redirect(redirectTo);
      });
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/loggedin').then(function(response) {
          service.currentUser = response.data.user;
          return service.currentUser;
        });
      }
    },

    // Information about the current user
    currentUser: null,

    getCurrentUser: function() {
      return service.currentUser;
    },

    // Is the current user authenticated?
    isAuthenticated: function(){
      return !!service.currentUser;
    },

    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.roles.indexOf('admin') >= 0);
    }
  };

  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(/*retryItem*/) {
    if ( queue.hasMore() ) {
      service.showLogin();
    }
  });

  return service;
}]);
