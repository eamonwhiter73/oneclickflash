var oneclickApp = angular.module('oneclickApp', [
  'angularjs.media.directives',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'btford.socket-io'
]);

oneclickApp.config(function ($routeProvider, $locationProvider, $httpProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider
    .when('/', {
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
    .when('/game', {
      templateUrl: 'partials/game',
      controller: 'BegCtrl'
    })
    .when('/gameinter', {
      templateUrl: 'partials/gameinter',
      controller: 'InterCtrl'
    })
    .when('/gameexp', {
      templateUrl: 'partials/gameexp',
      controller: 'ExpCtrl'
    })
    .when('/leaderboard', {
      templateUrl: 'partials/leaderboard'
    })
    .when('/leaderboardinter', {
      templateUrl: 'partials/leaderboardinter'
    })
    .when('/leaderboardexp', {
      templateUrl: 'partials/leaderboardexp'
    })
    .when('/admin', {
      templateUrl: 'partials/admin',
      authenticate: true
    })
    .when('/store', {
      templateUrl: 'partials/store',
      controller: 'MainCtrl'
    })
    .when('/login', {
      templateUrl: 'partials/login',
      controller: 'LoginCtrl'
    })
    .when('/signup', {
      templateUrl: 'partials/signup',
      controller: 'SignupCtrl'
    })
    .when('/settings', {
      templateUrl: 'partials/settings',
      controller: 'SettingsCtrl',
      authenticate: true
    })
    .otherwise({
      redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
    
    // Intercept 401s and redirect you to login
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
      return {
        'responseError': function(response) {
          if(response.status === 401) {
            $location.path('/login');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    }]);
});
/*oneclickApp.controller('navbarCtrl', function($scope, $location) {
  $scope.isActive = function(path) {
    return $location.path() === path;
  };
});*/

/*oneclickApp.controller('testCtrl', function($scope) {
  $scope.firstVideo = 'BlQ2tMQzg80'; 
});*/