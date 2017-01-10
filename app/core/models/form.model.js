(function() {
  'use strict';

  angular
    .module('kd.core.models')
    .factory('Form', FormModel);

  /* @ngInject */
  function FormModel($log, CoreSlugAPI) {
    $log.info('{Model} Defining "Form" model.');
    var factory = {
      build: build
    };
    return factory;

    function build(kappSlug) {
      return CoreSlugAPI
        .service('forms', CoreSlugAPI.one('kapps', kappSlug));
    }
  }
})();
