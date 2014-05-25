'use strict';

var oneclickApp = angular.module('oneclickApp');

oneclickApp.controller('MainCtrl', function ($route, $scope, $http, $location, socket) {

  $scope.flashvars = {};

  $scope.menu2 = [{
    'title': 'Games',
    'link': '/game'
  }, {
    'title': 'Leaderboards',
    'link': '/leaderboard',
  }, {
    'title': 'Store',
    'link': '/store'
  }];

  $scope.isActive2 = function(route) {
    return route === $location.path();
  };

  $scope.go = function(location) {
    if($location.path() == '/leaderboard') {
      socket.emit('listContestantsInit')
    }
    $location.path(location);
  };
})