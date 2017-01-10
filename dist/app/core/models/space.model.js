(function() {
  'use strict';

  SpaceModel.$inject = ["$log", "CoreSlugAPI"];
  angular
    .module('kd.core.models')
    .factory('SpaceModel', SpaceModel);

  /* @ngInject */
  function SpaceModel($log, CoreSlugAPI) {
    $log.info('{Model} Defining "Space" model.');

    var factory = {
      build: build,
      current: current
    };
    return factory;

    function build() {
      return CoreSlugAPI.service('space');
    }

    function current() {
      return build().one('');
    }

  }
})();
