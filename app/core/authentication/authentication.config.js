(function() {
  'use strict';

  angular
    .module('kd.core.authentication')
    .config(config);

  /* @ngInject */
  function config($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
  }

})();
