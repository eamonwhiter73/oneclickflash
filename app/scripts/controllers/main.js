'use strict';

var oneclickApp = angular.module('oneclickApp');

oneclickApp.controller('MainCtrl', function ($route, $scope, $http, $location, socket) {
  $scope.score;

  $scope.contestants = [];
  $scope.contestantsinter = [];
  $scope.contestantsexp = [];

  socket.emit('listContestantsInit', $scope.contestants);
  socket.emit('listContestantsInitInter', $scope.contestantsinter);
  socket.emit('listContestantsInitExp', $scope.contestantsexp);

  // Incoming
  socket.on('onContestantsListed', function(data) {
    $scope.contestants.push.apply($scope.contestants, data);
  });

  socket.on('onContestantsListedInter', function(data) {
    $scope.contestantsinter.push.apply($scope.contestantsinter, data);
  });

  socket.on('onContestantsListedExp', function(data) {
    $scope.contestantsinter.push.apply($scope.contestantsexp, data);
  });

  socket.on('onContestantCreated', function(data) {
    $scope.contestants.push.apply(data);
  });

  socket.on('onContestantCreatedInter', function(data) {
    $scope.contestantsinter.push.apply(data);
  });

  socket.on('onContestantCreatedExp', function(data) {
    $scope.contestantsexp.push.apply(data);
  });

  socket.on('onContestantDeleted', function(data) {
    $scope.handleDeleteContestant(data.id);
  });

  socket.on('sendscore', function(data){
    $scope.score = data;
  })

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

  /*socket.on('sendscore', function(data) {
    console.log(data);
    $scope.score = data;
  });*/

  // Outgoing
  $scope.createContestant = function() {

    var contestant = {
      id: $scope.userstore.email,
      display_name: $scope.userstore.name,
      score: $scope.score
    };

    if($location.path() == '/game') {

      console.log("here in beginner");

      $scope.contestants.push(contestant);
      socket.emit('createContestant', contestant);

      _resetFormValidation();
      $location.path("/leaderboard");
    } 

    if($location.path() == '/gameinter') {

        console.log("here in inter");

        $scope.contestantsinter.push(contestant);
        socket.emit('createContestantInter', contestant);

        _resetFormValidation();
        $location.path("/leaderboardinter");
    } 

    if($location.path() == '/gameexp') {

        console.log("here in exp");

        $scope.contestantsinter.push(contestant);
        socket.emit('createContestantExp', contestant);

        _resetFormValidation();
        $location.path("/leaderboardexp");
    } 
  };

  $scope.refresh = function() {
    $route.reload();
  }

  $scope.goToInter = function() {
    $location.path("/gameinter");
  }

  $scope.goToBeg = function() {
    $location.path("/game");
  }
  
  $scope.goToExp = function() {
    $location.path("/gameexp");
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