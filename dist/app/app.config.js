(function() {
  'use strict';

  config.$inject = ["ConfigStoreProvider", "$windowProvider"];
  angular.module('kd.bundle.angular').config(config);

  /* @ngInject */
  function config(ConfigStoreProvider, $windowProvider) {
    var $window = $windowProvider.$get();
    //
    // We are going to load some essentials which are rendered into the kapp.jsp
    //
    ConfigStoreProvider.set('apiBaseUrl', $window.KD.api);
    ConfigStoreProvider.set('loginPath', $window.KD.base + '/app/login.do');
    ConfigStoreProvider.set('kappSlug', $window.KD.kappSlug);
    ConfigStoreProvider.set('kappName', $window.KD.kappName);
  }
})();
