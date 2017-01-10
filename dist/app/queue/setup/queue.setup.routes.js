(function() {
  'use strict';

  routes.$inject = ["$stateProvider"];
  angular
    .module('kd.bundle.angular.queue.setup')
    .config(routes);

  /* @ngInject */
  function routes($stateProvider) {
    $stateProvider.state('setup', {
      parent: 'protected',
      url: '/setup',

      views: {
        '': {
          templateUrl: 'queue/setup/queue.setup.tpl.html',
          controller: 'QueueSetupController as vm'
        }
      }
    });
  }
}());
