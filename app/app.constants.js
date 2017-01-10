(function() {
  'use strict';

  angular
    .module('kd.bundle.angular')
    .constant('bundlePath', bundlePath)
    .constant('toastr', toastr)
    .constant('moment', moment)
    .constant('_', _);

  function bundlePath(path) {
    return window.KD.bundlePath + path;
  }
})();
