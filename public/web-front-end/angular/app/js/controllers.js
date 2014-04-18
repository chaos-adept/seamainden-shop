'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('LoginCtrl', ['$routeParams', '$scope', '$rootScope', '$location', function ($routeParams, $scope, $rootScope, $location) {
        if ($routeParams.access_token) {
            setToken($routeParams.access_token); //todo dont use global variables, injection should be used
        }

        function setToken(access_token) {
            window.localStorage.setItem("access_token", access_token);
            $rootScope.access_token = access_token;
            $location.search("access_token", null);
            $location.path("/welcome");
        }
    }])
    .controller('WelcomeCtrl', ['$scope', '$http', function ($scope, $http) {
//        $http.get('/users/private/test', {params: {access_token: $scope.access_token}}).success(function (data) {
//            $scope.user = data;
//        });
    }])
    .controller('UserCtrl', ['$scope', '$http', '$rootScope', '$location', function ($scope, $http, $rootScope, $location) {
        var access_token = window.localStorage.getItem("access_token");
        if (access_token) {
            $rootScope.access_token = (access_token)
        }

        $scope.refresh = function () {
            if (!$rootScope.access_token) {
                $rootScope.user = undefined;
                $location.path('/login');
            } else {
                $http.get('/users/private/test', {params: {access_token: $scope.access_token}}).success(function (data) {
                    $rootScope.user = data;
                });
            }
        };

        $scope.logout = function () {
            window.localStorage.removeItem("access_token");
            $rootScope.access_token = undefined;
        };

        $rootScope.$watch('access_token', function () {
            $scope.refresh();
        });

        $scope.refresh();

    }]).
    controller('CatalogCtrl', ['$scope','CatalogProvider', function ($scope, CatalogProvider) {
        CatalogProvider.Load().then(function(data) {
            $scope.suits = data.suits;
        });

        //$scope.orderProp = 'age';

    }]);
