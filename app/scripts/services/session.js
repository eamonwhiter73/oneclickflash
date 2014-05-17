'use strict';

angular.module('oneclickApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
