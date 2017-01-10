(function() {
  'use strict';

  angular
    .module('kd.core.authentication')
    .controller('LoginController', LoginController);

  /* @ngInject */
  function LoginController($state, $log, AuthenticationService) {
    $log.debug('{LoginController} Initializing controller.');

    var vm = this;
    vm._username='';
    vm._password='';
    vm.hasError = false;
    vm.errorMsg = '';

    vm.submit = function() {
      AuthenticationService.login(vm._username, vm._password).then(
        function() {
          vm.hasError = false;
          vm.errorMsg = '';
          $state.go('loggingIn', {reload:true})
        }, function(result) {
          if(result.status === 401) {
            vm.hasError = true;
            vm.errorMsg = 'Username or password was incorrect.';
          }
        });
    };
  }
})();
