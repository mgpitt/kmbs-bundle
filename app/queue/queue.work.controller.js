(function() {
  'use strict';

  angular
    .module('kd.bundle.angular.queue')
    .controller('QueueWorkController', QueueWorkController);

  /* @ngInject */
  function QueueWorkController(item, $window, $scope, $state, $timeout, AssignmentService, Toast) {
    var vm = this;
    vm.item = item;

    var details = $scope.details;

    activate();

    function activate() {
      if(details.isMine()) {
        var itemPath = $window.KD.base + '/submissions/' + item.id;

        if(item.coreState === 'Closed') {
          itemPath += '?review';
        }

        K.reset();
        K.load({
          container: '#workContainer',
          path: itemPath,
          completed: function() {
            $timeout(function() {
              Toast.success('Completed item!');
              $state.go('queue.by', {}, {reload:true});
            }, 3000);
          },
          updated: function() {
            $timeout(function() {
              Toast.success('Updated item.');
              $state.go('.', {}, {reload:true});
            });
          }
        });
      }
    }

  }
}());
