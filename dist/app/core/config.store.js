(function() {
  'use strict';

  angular.module('kd.core')
    .provider('ConfigStore', ConfigStore);

  function ConfigStore() {
    var self = this;
    self.configs = {};

    var service = {
      set: set,
      $get: function() {
        return {
          get: get,
          set: set,
          currentKapp: {}
        };
      }
    };

    return service;

    function set(key, value) {
      self.configs[key] = value;
    }

    function get(key) {
      return self.configs[key];
    }

  }
})();
