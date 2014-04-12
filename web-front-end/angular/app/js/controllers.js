'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('LoginCtrl', ['$routeParams', '$scope', function($routeParams, $scope) {
    $scope.user_token = $routeParams.user_token;
  }])
  .controller('MyCtrl2', [function() {

  }]);
