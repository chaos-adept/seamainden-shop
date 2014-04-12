'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('LoginCtrl', ['$routeParams', '$scope', '$rootScope', '$location', function ($routeParams, $scope, $rootScope, $location) {
        if ($routeParams.access_token) {
            $rootScope.access_token = $routeParams.access_token;
            $location.search("access_token", null);
            $location.path("/welcome");
        }
    }])
    .controller('WelcomeCtrl', ['$scope', '$http', function ($scope, $http) {
        $http.get('/users/private/test', {params: {access_token: $scope.access_token}}).success(function (data) {
            $scope.user = data;
        });
    }]);
