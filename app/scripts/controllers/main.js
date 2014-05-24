'use strict';

var oneclickApp = angular.module('oneclickApp');

oneclickApp.controller('MainCtrl', function ($route, $scope, $http, $location, socket) {
  $scope.score;

  $scope.contestants = []; 

  socket.on('message', function(data) {
    $scope.scorefordisplay = data;
    console.log(data);
  }) 

  socket.emit('listContestantsInit');

  // Incoming
  socket.on('onContestantsListed', function(data) {
    $scope.contestants.push.apply($scope.contestants, data);
  });

  socket.on('onContestantCreated', function(data) {
    $scope.contestants.push.apply($scope.contestants, data);
  });

  socket.on('onContestantDeleted', function(data) {
    $scope.handleDeleteContestant(data.id);
  });

  var _resetFormValidation = function() {
    $("input:first").focus();
    var $dirtyInputs = $("#ldrbd").find(".new input.ng-dirty")
                    .removeClass("ng-dirty")
                    .addClass("ng-pristine");
  };

  $http({method: 'GET', url: '/api/users/me'}).
    success(function(data, status, headers, config) {
      $scope.userstore = data;
      // this callback will be called asynchronously
      // when the response is available
    }).
    error(function(data, status, headers, config) {
      console.log("There was an error" + data);
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });

  socket.on('sendscore', function(data) {
    console.log(data);
    $scope.score = data;
  });

  // Outgoing
  $scope.createContestant = function() {
    
    socket.emit('sendscore');

    var contestant = {
      id: $scope.userstore.email,
      display_name: $scope.userstore.name,
      score: $scope.score
    };

    $scope.contestants.push(contestant);
    socket.emit('createContestant', contestant);

    _resetFormValidation();
    $location.path("/leaderboard");
  };

  $scope.refresh = function() {
    $route.reload();
  }

  $scope.deleteContestant = function(id) {
    $scope.handleDeleteContestant(id);

    socket.emit('deleteContestant', {id: id});
  };

  $scope.handleDeleteContestant = function(id) {
    console.log('HANDLE DELETE CONTESTANT', id);

    var oldContestants = $scope.contestants,
    newContestants = [];

    angular.forEach(oldContestants, function(contestant) {
      if(contestant.id !== id) {
        newContestants.push(contestant);
      }
    });

    $scope.contestants = newContestants;
  }

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
  };

});

$(function(){

  setTimeout(function(){
    // wait till angular is done populating the list

    // focus the first field
    $("input:first").focus();

    var $requiredInputs = $("#ldrbd").find("input[required]:not('.ng-dirty')");
    $requiredInputs.on("blur", function(){
      $(this)
        .removeClass("ng-pristine")
        .addClass("ng-dirty")
        .attr({
          placeholder: "Required"
        });

    });
  }, 100);

});

oneclickApp.directive('contestant', function(socket) {
  var linker = function(scope, element, attrs) {
      element.hide().fadeIn();
    };

  var controller = function($scope) {
      // Incoming
      socket.on('onContestantUpdated', function(data) {
        // Update if the same contestant
        if(data.id == $scope.contestant.id) {
          $scope.contestant.display_name = data.display_name;
          $scope.contestant.score = Number(data.score);
        }
      });

      // Outgoing
      $scope.updateContestant = function(contestant) {
        socket.emit('updateContestant', contestant);
      };

      $scope.deleteContestant = function(id) {
        $scope.ondelete({
          id: id
        });
      };
    };

  return {
    restrict: 'A',
    link: linker,
    controller: controller,
    scope: {
      contestant: '=',
      ondelete: '&'
    }
  };
});

oneclickApp.factory('socket', function($rootScope) {
  var socket = io.connect();
  return {
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});