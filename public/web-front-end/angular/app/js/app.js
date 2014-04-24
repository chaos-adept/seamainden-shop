'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/catalog', {templateUrl: 'partials/catalog.html', controller: 'CatalogCtrl'});
  $routeProvider.when('/cart', {templateUrl: 'partials/cart.html', controller: 'CartCtrl'});
  $routeProvider.when('/suites/:id', {templateUrl: 'partials/suite-details.html', controller: 'SuiteDetailsCtrl'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl', reloadOnSearch: false});
  $routeProvider.when('/welcome', {templateUrl: 'partials/welcome.html', controller: 'WelcomeCtrl'});
  $routeProvider.otherwise({redirectTo: '/catalog'});
}]);
