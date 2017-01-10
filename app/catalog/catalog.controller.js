(function() {
  'use strict';

  angular.module('kd.bundle.angular.catalog').controller('CatalogController', CatalogController);

  /* @ngInject */
  function CatalogController(forms, Submission, $state) {
    var vm = this;
    // MEMBERS
    vm.forms = forms;

    // FUNCTIONS
    vm.formClass = getFormClass;
    vm.isChildActive = isChildActive;

    // INITIALIZE AND ACTIVATE
    activate();

    function isChildActive() {
      return _.startsWith($state.$current.name, 'catalog.form');
    }

    function getFormClass(form) {
      var formIcon = 'fa-gear';
      var attribute = _.find(form.attributes, {name:'iconClass'});

      if(typeof attribute !== 'undefined') {
        formIcon = attribute.values[0];
      }
      return formIcon;
    }

    function activate() {
    }
  }
})();
