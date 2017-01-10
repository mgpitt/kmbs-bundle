(function() {
  'use strict';

  angular
    .module('kd.core.models')
    .factory('FormTypes', FormTypesModel);

  /* @ngInject */
  function FormTypesModel($log, CoreNameAPI) {
    $log.info('{Model} Defining "FormTypes" model.');
    var factory = {
      build: build
    };
    return factory;

    function build(kappSlug) {
      return CoreNameAPI
        .service('formTypes', CoreNameAPI.one('kapps', kappSlug));
    }
  }
})();
