(function() {
  'use strict';
  QueueController.$inject = ["currentKapp", "filters", "queueName", "queueType", "queueDetailsValue", "queueSummaryValue", "AssignmentService", "$rootScope", "$state"];
  angular
    .module('kd.bundle.angular.queue')
    .controller('QueueController', QueueController);

  /* @ngInject */
  function QueueController(currentKapp, filters, queueName, queueType, queueDetailsValue, queueSummaryValue, AssignmentService, $rootScope, $state) {
    var queue = this;
    queue.currentKapp = currentKapp;
    queue.filters = filters;
    queue.queueName = queueName;
    queue.queueType = queueType;
    queue.filterName = '';
    queue.loading = false;

    queue.changeFilter = changeFilter;
    queue.friendlyAssignedName = friendlyAssignedName;
    queue.friendlyAssignedGroup = friendlyAssignedGroup;
    queue.friendlyDueDate = friendlyDueDate;
    queue.friendlyDetails = friendlyDetails;
    queue.hasDetails = hasDetails;
    queue.friendlySummary = friendlySummary;
    queue.friendlyStatus = friendlyStatus;
    queue.isOverdue = isOverdue;

    function changeFilter() {
      $state.go('queue.by', {filterName:queue.filterName}, {reload:true});
    }

    function friendlyDetails(item) {
      return item.values[queueDetailsValue] || '';
    }

    function hasDetails(item) {
      return !_.isEmpty(item.values[queueDetailsValue]); 
    }
    
    function friendlySummary(item) {
      return item.values[queueSummaryValue] || '';
    }

    function friendlyAssignedName(item) {
      var assignedName = item.values['Assigned Individual Display Name'];
      var assignedId = item.values['Assigned Individual'];
      var friendlyName = 'Unassigned';

      if(!_.isEmpty(assignedName)) {
        friendlyName = assignedName;
      } else if(!_.isEmpty(assignedId)) {
        friendlyName = assignedId;
      }
      return friendlyName;
    }

    function friendlyAssignedGroup(item) {
      var friendlyName = 'Unassigned';
      var assignedGroup = item.values['Assigned Group'];
      if(!_.isEmpty(assignedGroup)) {
        friendlyName = AssignmentService.withoutRoot(assignedGroup);
      }

      return friendlyName;
    }

    function friendlyDueDate(item) {
      var dueDate = item.values['Due Date'];
      return dueDate;
    }

    function friendlyStatus(item) {
      var status = item.values['Status'];

      return status;
    }

    function isOverdue(dueDate) {
      var now = moment(new Date());
      return now.isAfter(moment(dueDate));
    }

    activate();

    function activate() {
      // The queue list controller will broadcast that it changed the filter.
      // This helps us with knowing what the active filter is when the child
      // state is loaded directly.
      // $rootScope.$on('$queueFilterChange', function(event, filterName) {
      //   vm.activeFilter = filterName;
      // });

      // We'll also listen for state changes when this controller is still visible.
      // If the state doesn't start with queue.by it is a change to a state which
      // is not filtering, so we'll blank out the active filter.
      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
        if(!_.startsWith(toState.name, 'queue.by')) {
          queue.filterName = '';
        }
      });
    }
  }
}());
