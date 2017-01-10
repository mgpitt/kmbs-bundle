(function() {
  'use strict';

  activate.$inject = ["$rootScope", "AuthenticationService", "CoreAPI", "$state", "$log", "$injector"];
  angular
    .module('kd.core.authentication')
    .run(activate);

  /* @ngInject */
  function activate($rootScope, AuthenticationService, CoreAPI, $state, $log, $injector) {
    // Handle unauthorized responses.
    CoreAPI.setErrorInterceptor(function(response) {
      if(response.status === 401) {
        $log.debug('{Restangular} Unauthorized error.');

        var rejectedState = AuthenticationService.rejectedState;

        //if(AuthenticationService.isUserObjectValid()) {
          var loginModal = $injector.get('LoginModal');
          loginModal.open().then(function() {
            $state.go(rejectedState.toState.name, rejectedState.toParams);
          });
        //} else {
        //  $state.go('login');
        //}
      }
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams) {
      AuthenticationService.rejectedState.toState = toState;
      AuthenticationService.rejectedState.toParams = toParams;
    });
  }
})();
