(function() {
  'use strict';

  angular
    .module('kd.bundle.angular.queue')
    .controller('QueueSummaryController', QueueSummaryController);

  /* @ngInject */
  function QueueSummaryController(item) {
    var vm = this;
    vm.item = item;
  }
}());
