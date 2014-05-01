'use strict';

angular.module("phi.i18n", [], ["$provide", function($provide) {
  $provide.constant("I18N.MESSAGES", {
    'error.global': 'Error: {{message}}',
    'errors.route.changeError':'Route change error',
    'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
    'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
    'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
    'crud.user.save.error':"Something went wrong when saving a user...",
    'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
    'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
    'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
    'login.error.serverError': "There was a problem with authenticating: {{exception}}.",
    'login.info': "Please enter your login details",
    'menu.title.teams.create': 'Create New Team',
    'menu.title.teams.list': 'Teams',
    'menu.title.matches.create': 'Create New Match',
    'menu.title.matches.list': 'Matches',
    'menu.title.pronostics.list': 'Pronostics',
    'menu.signin': 'Login',
    'menu.signout': 'Signout',
    'menu.register': 'Register',
    'form.register.fullname': 'Full Name',
    'form.register.username': 'Username',
    'form.register.password': 'Password',
    'form.register.password.repeat': 'Repeat Password',
    'form.register.signup': 'Sign up',
    'form.register.login': 'login',
    'form.register.infos': 'Hello and welcome,<br/><br/>By registering, you can make prognostic on upcoming matches and compare yourself to other users of the application.<br/><br/>Good prognosis.',
    'page.index.welcome': 'Welcome to the website of the world cup of foot Brazil 2014'
  });
}]);