'use strict';

angular.module('oneclickApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.flashvars = {};

    $scope.menu2 = [{
      'title': 'Games',
      'link': '/game'
    }, {
      'title': 'Leaderboards',
      'link': '/leaderboard'
    }, {
      'title': 'Store',
      'link': '/store'
    }];

    $scope.isActive2 = function(route) {
      return route === $location.path();
    };

    $scope.go = function(location) {
    	$location.path(location);
    }
  })
