(function() {
  'use strict';

  FilterQualificationController.$inject = ["filter", "$scope"];
  angular
    .module('kd.bundle.angular.queue.setup')
    .controller('FilterQualificationController', FilterQualificationController);

  /* @ngInject */
  function FilterQualificationController(filter, $scope) {
    var vm = this;
    vm.filter = filter;
    vm.tmpQualification = {};

    vm.resetTempQualification = resetTempQualification;
    vm.addQualification = addQualification;
    vm.removeQualification = removeQualification;
    vm.save = save;

    activate();

    function addQualification() {
      vm.filter.qualifications.push(vm.tmpQualification);
      resetTempQualification();
    }

    function removeQualification(index) {
      vm.filter.qualifications.splice(index, 1);
    }

    function resetTempQualification() {
      vm.tmpQualification = {
        field: '',
        value: ''
      };
    }

    function save() {
      $scope.$close(vm.filter);
    }

    function activate() {
      resetTempQualification();

      if(!(vm.filter.qualifications instanceof Array)) {
        vm.filter.qualifications = [];
      }
    }
  }
}());
