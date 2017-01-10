(function() {
  'use strict';

  angular
    .module('kd.core.authentication')
    .config(routes);

  /* @ngInject */
  function routes($stateProvider) {
    $stateProvider.state('login', {
      parent: 'public',
      url: '/login',

      views: {
        '': {
          controller: 'LoginController as vm',
          templateUrl: 'core/authentication/login.tpl.html'
        }
      }

    })
  }
})();