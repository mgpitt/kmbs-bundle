(function() {
  'use strict';

  AssignmentService.$inject = ["Submission", "$q"];
  angular
    .module('kd.bundle.angular.queue')
    .service('AssignmentService', AssignmentService);

  /* @ngInject */
  function AssignmentService(Submission, $q) {
    var service = {
      // Actions
      grabIt: grabIt,

      // Helpers
      getGroups: getGroups,
      getMembers: getMembers,
      getAssignedGroups: getAssignedGroups,
      isGroupLeaf: isGroupLeaf,
      withoutRoot: withoutRoot,
      withRoot: withRoot,
      setAdminKapp: setAdminKapp,
      setAssignmentBase: setAssignmentBase
    };

    var adminKapp = null;
    var rootGroup = null;

    return service;

    function setAdminKapp(adminKappSlug) {
      adminKapp = adminKappSlug;
    }

    function setAssignmentBase(assignmentBaseGroup) {
      rootGroup = assignmentBaseGroup;
    }

    function withoutRoot(group) {
      if(_.startsWith(group, rootGroup + '::')) {
        return group.slice(rootGroup.length + 2);
      } else {
        return group;
      }
    }

    function withRoot(group) {
      var groupWithRoot = group;
      if(!_.startsWith(group, rootGroup)) {
        if(_.isEmpty(group)) {
          groupWithRoot = rootGroup;
        } else {
          groupWithRoot = rootGroup + '::' + group;
        }
      }

      return groupWithRoot;
    }

    function getAssignedGroups(item) {
      var group = withoutRoot(item.values['Assigned Group']);
      var groups = [];
      if(!_.isEmpty(group)) {
        groups = group.split('::');
      }

      return groups;
    }

    function isGroupLeaf(item) {
      var deferred = $q.defer();
      getGroups(withRoot(item.values['Assigned Group'])).then(
        function(groups) {
          if(groups.length < 1) {
            //vm.state.showMembersButton = _.isEmpty(vm.memberId);
            deferred.resolve(true);
          } else {
            deferred.resolve(false);
          }
        }, function() {
          deferred.reject();
        }
      );

      return deferred.promise;
    }




    // var helperSubmissionsBase = $window.KD.base + '/' + kappSlug + '/' + form.slug;

    function grabIt(currentUser, currentGroup, item) {
      var deferred = $q.defer();

      // First we need to determine if the current user is a member of the currently
      // assigned group in order for them to "grab it".
      getMembers(currentGroup).then(
        function(members) {
          var association = _.find(members, function(member) {
            if(member.values['Group Id'] === withRoot(currentGroup) &&
               member.values['Username'] === currentUser) {
              return true;
            }
            return false;
          });

          // Check to see if the user we're assigning had an association
          // with the currently assigned group.
          if(typeof association !== 'undefined') {
            item.values['Assigned Individual'] = currentUser;
            item.values['Assigned Individual Display Name'] = currentUser;

            // We get currentPage in a different format than the server and we
            // don't actually care about sending it since we don't want to change
            // what page we're on. So just remove it.
            delete item.currentPage;

            // Save the submission with the new assignment information.
            item.put().then(
              function() {
                deferred.resolve('Successfully grabbed item.');
              },
              function() {
                deferred.reject('Failed to save assignment.');
              }
            );
          } else {
            deferred.reject('Current user is not a member of the currently assigned group.');
          }

        },
        function() {
          deferred.reject('Failed to retrieve associations.');
        }
      );


      return deferred.promise;
    }

    function getGroups(parent) {
      parent = withRoot(parent);

      return Submission.search(adminKapp, 'group')
        .eq('values[Parent]', parent)
        .coreState('Draft')
        .include('values')
        .execute();

    }

    /*
    coreState=Draft&include=values&q=(+(+values%5BObject+1+Type%5D+%3D+%22Group%22+AND+values%5BObject+1+Id%5D+%3D+%22US::IT%22)+OR+(+values%5BObject+2+Type%5D+%3D+%22Group%22+AND+values%5BObject+2+Id%5D+%3D+%22US::IT%22))
     */

    function getMembers(group) {
      group = withRoot(group);

      return Submission.search(adminKapp, 'group-membership')
        .eq('values[Group Id]', group)
        .coreState('Draft')
        .include('values')
        .execute();

    }
  }
}());
