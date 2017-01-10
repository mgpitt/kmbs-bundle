(function() {
  'use strict';

  LayoutPublicController.$inject = ["$state", "kappSlug", "kappName"];
  angular
    .module('kd.bundle.angular.layout')
    .controller('LayoutPublicController', LayoutPublicController);

  /* @ngInject */
  function LayoutPublicController($state, kappSlug, kappName) {
    var layout = this;
    layout.isParentActive = isParentActive;
    layout.kappSlug = kappSlug;
    layout.kappName = kappName;

    function isParentActive(parentState) {
      return _.startsWith($state.$current.name, parentState);
    }
  }
})();
