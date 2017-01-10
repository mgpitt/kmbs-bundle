(function() {
  'use strict';

  ItemsService.$inject = ["Submission"];
  angular
    .module('kd.bundle.angular.queue')
    .service('ItemsService', ItemsService);

  /* @ngInject */
  function ItemsService(Submission) {
    var service = {
      filter: filter
    };

    return service;

    function filter(kappSlug, user, itemFilter, formType, pageToken) {
      var searcher =  Submission.search(kappSlug);

      _.each(itemFilter.qualifications, function(qualification) {
        if(qualification.value === '${openStatuses}') {
          var openStatuses = ['Open', 'In Progress'];
          searcher.or();
          _.each(openStatuses, function(status) {
            searcher.eq(qualification.field, status);
          });
          searcher.end();
        } else {
          var rval = qualification.value;
          var lval = qualification.field;

          if(qualification.value === '${me}') {
            rval = user.username;
          }

          if(_.startsWith(lval, 'values')) {
            searcher.eq(lval, rval);
          } else {
            if(lval === 'coreState') {
              searcher.coreState(rval);
            }
          }

        }

      });

      if(!_.isEmpty(pageToken)) {
        searcher.pageToken(pageToken);
      }

      return searcher
        .type(formType)
        .limit(5)
        .includes(['values','details,form'])
        .execute();
    }
  }
}());
