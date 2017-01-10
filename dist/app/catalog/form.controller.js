(function() {
  'use strict';

  FormController.$inject = ["kappSlug", "form", "$window", "$state", "$scope", "$timeout"];
  angular
    .module('kd.bundle.angular.catalog')
    .controller('FormController', FormController);

  /* @ngInject */
  function FormController(kappSlug, form, $window, $state, $scope, $timeout) {
    var vm = this;
    // MEMBERS
    vm.form = form;

    // INITIALIZE AND ACTIVATE
    activate();

    function activate() {
      var formPath = $window.KD.base + '/' + kappSlug + '/' + form.slug;

      K.reset();
      K.load({
        container: '#formContainer',
        path: formPath,
        completed: function() {
          $timeout(function() {
            $state.go('catalog');
          }, 3000);
        }
      });
    }
  }
})();
