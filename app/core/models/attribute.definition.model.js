(function() {
  'use strict';

  angular
    .module('kd.core.models')
    .factory('AttributeDefinition', AttributeDefinition);

  /* @ngInject */
  function AttributeDefinition($log, CoreAPI) {
    $log.info('{Model} Defining "AttributeDefn" model.');

    return {
      build: build,
      scopes: {
        space: ['Space', 'User'],
        kapp: ['Category','Form','Kapp']
      }
    };
    function build(scope, kappSlug) {
      var resource = scope.toLowerCase() + 'AttributeDefinitions';
      if (kappSlug === undefined) {
        return CoreAPI.service(resource);
      } else {
        return CoreAPI.service(resource, CoreAPI.one('kapps', kappSlug));
      }
    }
  }
})();
