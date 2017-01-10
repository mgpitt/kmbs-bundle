(function() {
  'use strict';

  angular.module('kd.bundle.angular').config(routes);

  /* @ngInject */
  function routes($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/logging-in');

    $stateProvider.state('loggingIn', {
      url: '/logging-in',

      views: {
        '': {
          template: '',
          controller: function(AuthenticationService, $state) {
            AuthenticationService.retrieveCurrentUser().then(
              function() {
                $state.go('queue.by', {filterName: '__default__'});
              },
              function() {
                $state.go('login');
              }
            );
          }
        }
      }
    });
  }
})();
