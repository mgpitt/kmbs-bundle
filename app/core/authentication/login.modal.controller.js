(function() {
  'use strict';

  angular
    .module('kd.core.authentication')
    .controller('LoginModalController', LoginModalController);

  /* @ngInject */
  function LoginModalController($scope, $rootScope, $log, AuthenticationService) {
    $log.debug('{LoginModalController} Initializing controller.');

    var vm = this;
    vm.cancel = $scope.$dismiss;
    vm.hasError = false;
    vm.errorMsg = '';

    // Close the modal if something else authenticated.
    $rootScope.$on('kd-auth-success', function() {
      $scope.$close();
    });

    vm.submit = function() {
      AuthenticationService.login($scope._username, $scope._password).then(
        function(data) {
          vm.hasError = false;
          vm.errorMsg = '';
          $scope.$close(data);

        }, function(result) {
          if(result.status === 401) {
            vm.hasError = true;
            vm.errorMsg = 'Username or password was incorrect.';
          }
        });
    };
  }
})();
