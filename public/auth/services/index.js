'use strict';

// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('phi.auth.security', [
  'phi.auth.security.service',
  'phi.auth.security.interceptor',
  'phi.auth.security.authorization']);