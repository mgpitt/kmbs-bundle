(function() {
  'use strict';

  angular
    .module('kd.bundle.angular.queue')
    .controller('QueueAssignmentController', QueueAssignmentController);

  /* @ngInject */
  function QueueAssignmentController(item, $state, $scope, AssignmentService, Toast) {
    var vm = this;
    vm.groups = [];
    vm.memberId = '';
    vm.memberName = '';
    vm.groupsToAssign = [];
    vm.membersToAssign = [];

    vm.state = {
      loadingGroups: false,
      assigningGroups: false,
      assigningMembers: false,
      showMembersButton: false,
      showGroupsButton: false
    };

    vm.startGroupAssignment = startGroupAssignment;
    vm.startMidGroupAssignment = startMidGroupAssignment;
    vm.startMemberAssignment = startMemberAssignment;
    vm.canAssignGroup = canAssignGroup;
    vm.getNameFromMember = getNameFromMember;
    vm.selectMember = selectMember;
    vm.save = save;
    vm.cancel = cancel;

    var queue = $scope.queue;

    activate();

    function canAssignGroup() {
      var canAssign = !vm.state.assigningGroups &&
                      !vm.state.assigningMembers &&
                      vm.state.showGroupsButton;
      return canAssign;
    }

    function getNameFromMember(member) {
      return member.values['Username'];
    }

    function startMidGroupAssignment(groupIndex) {
      vm.groups = vm.groups.slice(0, groupIndex);
      vm.memberId = '';
      vm.memberName = '';
      vm.membersToAssign = [];
      vm.state.assigningGroups = true;
      vm.state.showMembersButton = false;
      vm.state.showGroupsButton = false;
      vm.startGroupAssignment(vm.groups.join('::'));
    }

    function startGroupAssignment(parent) {
      item.values['Assigned Individual'] = '';
      item.values['Assigned Individual Display Name'] = '';
      if(_.isEmpty(parent)) {
        item.values['Assigned Group'] = '';
      } else {
        item.values['Assigned Group'] = AssignmentService.withoutRoot(parent);
        populateAssignedGroups();
      }
      queue.loading = true;
      vm.state.assigningGroups = true;
      vm.state.showMembersButton = false;
      vm.state.showGroupsButton = false;

      AssignmentService.getGroups(parent).then(
        function(groups) {
          queue.loading = false;
          vm.groupsToAssign = _.filter(groups, function(group) {
            return group.values['Status'] === 'active';
          });

          if(groups.length < 1) {
            vm.state.assigningGroups = false;
            vm.startMemberAssignment();
          }
        },
        function() {
          queue.loading = false;
          Toast.error('Failed to look up groups.');
        }
      );
    }

    function startMemberAssignment() {
      if(_.isEmpty(item.values['Assigned Group'])) {
        return;
      }

      item.values['Assigned Individual'] = '';
      item.values['Assigned Individual Display Name'] = '';

      vm.memberId = '';
      vm.memberName = '';
      vm.membersToAssign = [];
      vm.state.assigningMembers = true;
      vm.state.showMembersButton = false;
      AssignmentService.getMembers(item.values['Assigned Group']).then(
        function(members) {
          vm.membersToAssign = members;
        },
        function() {
          Toast.error('Failed to look up members.');
        }
      );
    }

    function selectMember(member) {
      var memberId = getNameFromMember(member);
      item.values['Assigned Individual'] = memberId;
      item.values['Assigned Individual Display Name'] = memberId;
      vm.memberId = memberId;
      vm.memberName = memberId;

      vm.save();
    }

    function cancel() {
      $state.go('.', {}, {reload:true});
    }

    function save() {
      vm.state.assigningMembers = false;
      vm.state.assigningGroups = false;
      vm.state.showMembersButton = false;
      queue.loading = true;

      delete item.currentPage;

      console.log('lkjfsafdsafasd ', vm.groups)

      console.log('fixing assigned group', item.values['Assigned Group']);
      item.values['Assigned Group'] = AssignmentService.withRoot(item.values['Assigned Group']);
      console.log('fixing assigned group', item.values['Assigned Group']);

      item.put().then(
        function() {
          vm.groupsToAssign = [];
          vm.membersToAssign = [];

          queue.loading = false;
          Toast.success('Updated item assignment.');
          $state.go('queue.by.details.summary', {}, {reload:true});
        },
        function() {
          queue.loading = false;
          Toast.error('Failed to save queue item.');
        }
      );
    }

    function populateAssignedGroups() {
      vm.groups = AssignmentService.getAssignedGroups(item);
    }

    function populateAssignedMember() {
      vm.memberId = item.values['Assigned Individual'];
      vm.memberName = item.values['Assigned Individual Display Name'];
    }

    function checkMemberAssignment() {
      AssignmentService.isGroupLeaf(item).then(
        function(isLeaf) {
          if(isLeaf) {
            vm.state.showMembersButton = _.isEmpty(vm.memberId);
          } else {
            vm.state.showGroupsButton = true;
          }
        }
      )
    }

    function activate() {
      populateAssignedGroups();
      populateAssignedMember();
      checkMemberAssignment();
    }

  }
}());
