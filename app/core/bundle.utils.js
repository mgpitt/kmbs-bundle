(function() {
  'use strict';

  angular
    .module('kd.core')
    .service('BundleUtils', BundleUtils);

  function BundleUtils() {
    return {
      path: function(path) {
        return window.KD.bundlePath + path;
      }
    }
  }
})();
