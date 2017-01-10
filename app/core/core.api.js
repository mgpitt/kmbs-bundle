(function() {
  'use strict';

  angular
    .module('kd.core')
    .factory('CoreAPI', CoreAPI)
    .factory('CoreSlugAPI', CoreSlugAPI)
    .factory('CoreNameAPI', CoreNameAPI);

  /* @ngInject */
  function CoreAPI(Restangular, ConfigStore) {
    return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setDefaultHttpFields({cache: false});
      RestangularConfigurer.setBaseUrl(ConfigStore.get('apiBaseUrl'));
      RestangularConfigurer.addResponseInterceptor(function(data, operation, what) {
        // Check the 'what', usually plural. Example 'kapps'.
        if(typeof data[what] === 'undefined') {

          var newWhat = what.replace(/s$/, '');
          if(typeof data[newWhat] === 'undefined') {
            newWhat = what.replace(/ies$/, 'y');
            if(typeof data[newWhat] === 'undefined') {
              // If the singular of 'what' is undefined, then return the raw data.
              return data;
            }
            return data[newWhat];
          } else {
            // Otherwise return the singular object.
            return data[newWhat];
          }
        }

        // Handle pagination. If the next page token has been passed then pass it through to the resource.
        if(typeof data.nextPageToken !== 'undefined') {
          data[what].nextPageToken = data.nextPageToken;
        }
        return data[what];
      });
    });
  }

  /* @ngInject */
  function CoreSlugAPI(CoreAPI) {
    return CoreAPI.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setRestangularFields({
        id: 'slug'
      });
    });
  }

  /* @ngInject */
  function CoreNameAPI(CoreAPI) {
    return CoreAPI.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setRestangularFields({
        id: 'name'
      });
    });
  }
})();
