'use strict';

angular.module('phi.system.resource', [])
  .factory('phiResource', ['$http', '$q', function ($http, $q) {

    function PhiResourceFactory(collectionName) {

      var url = '/api/' + collectionName;
      var defaultParams = {};

      var thenFactoryMethod = function (httpPromise, successcb, errorcb, isArray) {
        var scb = successcb || angular.noop;
        var ecb = errorcb || angular.noop;

        return httpPromise.then(function (response) {
          var result;
          if (response.data.status === true) {
            if (isArray) {
              result = [];
              for (var i in response.data.result) {
                result.push(new Resource(response.data.result[i]));
              }
              // for (var i = 0; i < response.data.result.length; i++) {
              //   result.push(new Resource(response.data.result[i]));
              // }
            } else {
              if (response.data.result === null) {
                return $q.reject({
                  code: 'resource.notfound',
                  collection: collectionName
                });
              } else {
                result = new Resource(response.data.result);
              }
            }
          } else if (response.status === 204) {
            result = null;
          } else {
            // notification
            ecb(undefined, response.status, response.headers, response.config);
            return undefined;
          }
          scb(result, response.status, response.headers, response.config);
          return result;
        }, function (response) {
          if (response) {
            ecb(undefined, response.status, response.headers, response.config);
          } else {
            ecb(undefined);
          }
          return undefined;
        });
      };

      var Resource = function (data) {
        angular.extend(this, data);
      };

      Resource.all = function (params, successcb, errorcb) {
        var httpPromise;
        if (params && typeof params !== 'function') {
          httpPromise = $http.get(url, {params:angular.extend({}, defaultParams, params)});
        } else {
          httpPromise = $http.get(url);
          errorcb = successcb;
          successcb = params;
        }
        return thenFactoryMethod(httpPromise, successcb, errorcb, true);
      };

      Resource.query = function (params, successcb, errorcb) {
        var httpPromise = $http.get(url, {params:angular.extend({}, defaultParams, params)});
        return thenFactoryMethod(httpPromise, successcb, errorcb, true);
      };

      Resource.getById = function (id, params, successcb, errorcb) {
        var httpPromise;
        if (params && typeof params !== 'function') {
          httpPromise = $http.get(url + '/' + id, {params:angular.extend({}, defaultParams, params)});
        } else {
          httpPromise = $http.get(url + '/' + id);
          errorcb = successcb;
          successcb = params;
        }
        return thenFactoryMethod(httpPromise, successcb, errorcb);
      };

      Resource.getByIds = function (ids, successcb, errorcb) {
        var qin = [];
        angular.forEach(ids, function (id) {
           qin.push({$oid: id});
        });
        return Resource.query({_id:{$in:qin}}, successcb, errorcb);
      };

      Resource.distinct = function (params, key, successcb, errorcb) {
        return Resource.query({q:params, d:key}, successcb, errorcb);
      };

      //instance methods

      Resource.prototype.$id = function () {
        if (this._id) {
          return this._id;
        }
      };

      Resource.prototype.$isNew = function() {
        return (!this.$id()) ? true : false;
      };

      Resource.prototype.$save = function (successcb, errorcb) {
        var httpPromise = $http.post(url, this, {params:defaultParams});
        return thenFactoryMethod(httpPromise, successcb, errorcb);
      };

      Resource.prototype.$update = function (successcb, errorcb) {
        var httpPromise = $http.put(url + '/' + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
        return thenFactoryMethod(httpPromise, successcb, errorcb);
      };

      Resource.prototype.$remove = function (successcb, errorcb) {
        var httpPromise = $http['delete'](url + '/' + this.$id(), {params:defaultParams});
        return thenFactoryMethod(httpPromise, successcb, errorcb);
      };

      Resource.prototype.$saveOrUpdate = function (params, savecb, updatecb, errorSavecb, errorUpdatecb) {
        if (this.$id()) {
          return this.$update(params, updatecb, errorUpdatecb);
        } else {
          return this.$save(savecb, errorSavecb);
        }
      };

      return Resource;
    }
    return PhiResourceFactory;
  }]);
