(function() {
  'use strict';

  angular.module('kd.core.authentication')
    .service('LoginModal', LoginModal);

  /* @ngInject */
  function LoginModal($uibModal) {
    return {
      open: function() {
        var instance = $uibModal.open({
          templateUrl: 'core/authentication/login.modal.tpl.html',
          controller: 'LoginModalController as vm'
        });

        return instance.result;
      }
    };
  }
})();
