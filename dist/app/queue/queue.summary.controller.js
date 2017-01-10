(function() {
  'use strict';

  QueueSummaryController.$inject = ["item"];
  angular
    .module('kd.bundle.angular.queue')
    .controller('QueueSummaryController', QueueSummaryController);

  /* @ngInject */
  function QueueSummaryController(item) {
    var vm = this;
    vm.item = item;
  }
}());
