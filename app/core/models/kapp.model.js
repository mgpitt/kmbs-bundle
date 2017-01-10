(function() {
  'use strict';

  angular
    .module('kd.core.models')
    .factory('KappModel', KappModel);

  /* @ngInject */
  function KappModel($log, CoreSlugAPI) {
    $log.info('{Model} Defining "Kapp" model.');
    var factory = {
      build: build
    };
    return factory;

    function build() {
      return CoreSlugAPI
        .service('kapps');
    }
  }
})();
