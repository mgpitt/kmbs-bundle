(function() {
  'use strict';

  routes.$inject = ["$urlRouterProvider", "$stateProvider"];
  angular.module('kd.bundle.angular').config(routes);

  /* @ngInject */
  function routes($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/logging-in');

    $stateProvider.state('loggingIn', {
      url: '/logging-in',

      views: {
        '': {
          template: '',
          controller: ["AuthenticationService", "$state", function(AuthenticationService, $state) {
            AuthenticationService.retrieveCurrentUser().then(
              function() {
                $state.go('queue.by', {filterName: '__default__'});
              },
              function() {
                $state.go('login');
              }
            );
          }]
        }
      }
    });
  }
})();
