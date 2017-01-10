(function() {
  'use strict';

  angular
    .module('kd.core.authentication')
    .service('AuthenticationService', AuthenticationService);

  /* @ngInject */
  function AuthenticationService($http, $log, $q, $rootScope, ConfigStore) {
    var self = this;
    self.currentUser = {};
    self.rejectedState = {};

    self.isUserObjectValid = function() {
      return (typeof self.currentUser.username !== 'undefined');
    };

    // Retrieve the current user from the server.
    self.retrieveCurrentUser = function() {
      var deferred = $q.defer();
      if(self.isUserObjectValid()) {
        deferred.resolve(self.currentUser);
      }

      $http.get(ConfigStore.get('apiBaseUrl') + '/me').success(function(user) {
        if(typeof user.username === 'undefined') {
          deferred.reject();
        }
        self.currentUser = user;
        deferred.resolve(self.currentUser);
      }).error(function() {
        deferred.reject();
      });

      return deferred.promise;
    };

    self.login = function(username, password) {
      var deferred = $q.defer();

      $http.post(ConfigStore.get('loginPath'), { 'j_username': username, 'j_password': password})
        .success(function(data) {
          $log.debug('{AuthenticationService} Successful authentication.', data);
          // Save the user object returned by authentication.
          self.currentUser = data;

          // Broadcast to the system that authentication was successful.
          $rootScope.$broadcast('kd-auth-success');

          // Resolve any promises to tasks that were attempting to log in.
          deferred.resolve(data);
        }).error(function(data, status) {
          $log.debug('{AuthenticationService} Failed authentication.', status);
          self.currentUser = {};
          $rootScope.$broadcast('kd-auth-failure');
          deferred.reject({
            data: data,
            status: status
          });
        });

      return deferred.promise;
    };
  }
})();
