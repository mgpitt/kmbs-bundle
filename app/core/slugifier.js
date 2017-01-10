(function() {
  'use strict';

  angular.module('kd.core').service('Slugifier', Slugifier);

  /* @ngInject */
  function Slugifier() {
    return {
      slugify: slugify
    };

    function slugify(text) {
      if(typeof text === 'undefined') {
        return '';
      }

      var slugified = '' + text;
      return slugified.trim()
        .toLowerCase()                  // Convert uppercase to lowercase
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^A-Za-z0-9\u0080-\u00FF\-]+/g, '');       // Remove all non-word chars
    }
  }

})();
