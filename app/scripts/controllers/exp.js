'use strict';

var oneclickApp = angular.module('oneclickApp');

oneclickApp.controller('ExpCtrl', function ($route, $scope, $http, $location, socket) {
  
  $scope.score3;

  $scope.contestantsexp = [];

  socket.emit('listContestantsInitExp');
  /*socket.emit('listContestantsInitClient', $scope.contestants);
  socket.emit('listContestantsInitInterClient', $scope.contestantsinter);
  socket.emit('listContestantsInitExpClient', $scope.contestantsexp);*/

  // Incoming
  socket.on('onContestantsListedExp', function(data) {
    console.log("in onContestantsListedExp");
    $scope.contestantsexp.push.apply($scope.contestantsexp, data);
    //socket.emit('listContestantsInitInterClient', $scope.contestantsinter);
  });
  socket.on('onContestantCreatedExp', function(data) {
    $scope.contestantsexp.push.apply(data);
  });

  socket.on('onContestantDeleted', function(data) {
    $scope.handleDeleteContestant(data.id);
  });

  socket.on('sendscore', function(data){
    a = data;
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

  /*socket.on('sendscore', function(data) {
    console.log(data);
    $scope.score3 = data;
  });*/

  // Outgoing
  $scope.createContestant = function() {

    socket.emit('requestscore');

    var contestant = {
      id: $scope.userstore.email,
      display_name: $scope.userstore.name,
      score: $scope.score3
    };

    $scope.contestantsexp.push(contestant);
    socket.emit('createContestantExp', contestant);

    _resetFormValidation();
    $location.path("/leaderboardexp");
  };

  $scope.refresh = function() {
    $route.reload();
  }

  /*$scope.goToInter = function() {
    $location.path("/gameinter");
  }

  $scope.goToBeg = function() {
    $location.path("/game");
  }
  
  $scope.goToExp = function() {
    $location.path("/gameexp");
  }

  $scope.goToInterLead = function() {
    $location.path("/leaderboardinter");
  }

  $scope.goToBegLead = function() {
    $location.path("/leaderboard");
  }
  
  $scope.goToExpLead = function() {
    $location.path("/leaderboardexp");
  }

  $scope.deleteContestant = function(id) {
    $scope.handleDeleteContestant(id);

    socket.emit('deleteContestant', {id: id});
  };*/

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
});