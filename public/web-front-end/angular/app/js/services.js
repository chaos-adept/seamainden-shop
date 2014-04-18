'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1')
    .factory('ConfigResource', ['$resource', function($resource) {
        return $resource('/config', null,
            {
                'Get': { method:'GET' , cache:true}
            });
    }])
    .factory('CatalogProvider', ['$http', 'ConfigResource', '$q', function ($http, ConfigResource, $q) {
        return {
            'Load': function () {
                var defer = $q.defer();

                ConfigResource.Get().$promise.then(function (config) {
                    $http.get(config.catalog.url, { cache:true }).success(function (catalog) {
                        defer.resolve(catalog);
                    });

                });

                return defer.promise;
            }
        }
    }]);

