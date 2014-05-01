'use strict';

angular.module('phi.system')
.config(['$httpProvider', function ($httpProvider) {

  var interceptor = [
    '$q',
    '$cacheFactory',
    '$timeout',
    '$rootScope',
    function ($q, $cacheFactory, $timeout, $rootScope) {

      /**
       * The total number of requests made
       */
       var reqsTotal = 0;

      /**
       * $timeout handle for latencyThreshold
       */
       var startTimeout;


      /**
       * calls phiLoading.complete() which removes the
       * loading bar from the DOM.
       */
       function setComplete() {
        $timeout.cancel(startTimeout);
        $rootScope.$broadcast('phiLoading:hide');
        reqsTotal = 0;
      }

      /**
       * Determine if the response has already been cached
       * @param  {Object}  config the config option from the request
       * @return {Boolean} retrns true if cached, otherwise false
       */
       function isCached(config) {
        var cache;
        var defaults = $httpProvider.defaults;

        if (config.method !== 'GET' || config.cache === false) {
          config.cached = false;
          return false;
        }

        if (config.cache === true && defaults.cache === undefined) {
          cache = $cacheFactory.get('$http');
        } else if (defaults.cache !== undefined) {
          cache = defaults.cache;
        } else {
          cache = config.cache;
        }

        var cached = cache !== undefined ?
        cache.get(config.url) !== undefined : false;

        if (config.cached !== undefined && cached !== config.cached) {
          return config.cached;
        }
        config.cached = cached;
        return cached;
      }


      return {
        'request': function(config) {
          // Check to make sure this request hasn't already been cached and that
          // the requester didn't explicitly ask us to ignore this request:
          if (!config.ignoreLoading && !isCached(config)) {
            reqsTotal++;
            if (reqsTotal <= 1) {
              $rootScope.$broadcast('phiLoading:show');
            }
          }
          return config;
        },

        'response': function(response) {
          if (!isCached(response.config)) {
            if (--reqsTotal <= 0) {
              setComplete();
            }
          }
          return response;
        },

        'responseError': function(rejection) {
          if (!isCached(rejection.config)) {
            if (--reqsTotal <= 0) {
              setComplete();
            }
          }
          return $q.reject(rejection);
        }
      };
    }];

    $httpProvider.interceptors.push(interceptor);
  }]);