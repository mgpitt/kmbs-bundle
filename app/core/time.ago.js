(function() {
  'use strict';

  angular
    .module('kd.core')
    .directive('timeAgo', timeAgo);

  /* @ngInject */
  function timeAgo(moment, $interval) {
    // Usage:
    // <span data-time-ago='submission.submittedAt'></span>
    var directive = {
      link: link,
      replace: false,
      restrict: 'EA',
      scope: {
        timeAgo: '='
      }
    };
    return directive;

    // The link function sets the text of the element to the '2 days ago' format and sets up the
    // bootstrap tooltip that shows the actual date/time string.
    function link(scope, element) {
      var applyTimeAgo = function() {
        if(typeof scope.timeAgo === 'undefined' || scope.timeAgo === null) {
          element.text('N/A');
        } else {
          var m = moment(scope.timeAgo);
          element.text('Due ' + m.fromNow());
          element.attr('title', m.format('MMMM Do YYYY, h:mm:ss A'));
          element.attr('data-toggle', 'tooltip');
          $(element).tooltip();
        }
      };

      // Register an interval to update the moment time-ago display, so that the counter increments as expected.
      var interval = $interval(applyTimeAgo, 10000);

      // Register a watch that will apply the moment time-ago display whenever the underlying date/time is changed.
      scope.$watch('timeAgo', applyTimeAgo);

      // When the directive is destroyed make sure that we clean up the interval.
      scope.$on('$destroy', function() {
        $interval.cancel(interval);
      });

    }
  }
})();
