(function() {
  'use strict';

  ToastService.$inject = ["toastr", "$templateRequest", "$rootScope", "$compile"];
  angular
    .module('kd.core')
    .service('Toast', ToastService);

  /* @ngInject */
  function ToastService(toastr, $templateRequest, $rootScope, $compile) {
    return {
      success: success,
      error: error,
      warning: warning,
      errorHandler: errorHandler
    };

    /*----------------------------------------------------------------------------------------------
     * Service Methods
     *--------------------------------------------------------------------------------------------*/
    function error(message) {
      toastr.error(message || 'Error');
    }

    function warning(message) {
      toastr.warning(message || 'Warning');
    }

    function success(message) {
      toastr.success(message || 'Success');
    }

    function errorHandler(options, callback) {
      initErrorOptions(options);
      return function(response) {
        defaultErrorHandler(response, options, callback);
      };
    }

    /*----------------------------------------------------------------------------------------------
     * Service Internals
     *--------------------------------------------------------------------------------------------*/

    function initErrorOptions(options) {
      options = options || {};
      // Set the default options hash
      var defaults = {
        // A custom message to use either in place of the
        // response message, or in addition to it
        message: undefined,
        // Overwrite the message from the response
        overwrite: false
      };
      // Overlay the defaults with the options passed in
      options = angular.merge({}, defaults, options);
      return options;
    }

    function defaultErrorHandler(response, options, callback) {
      // Retrieve the error template to be used.
      $templateRequest('core/toast/error.html').then(function(html) {
        // Convert the template into an element.
        var template = angular.element(html);

        // Create a new scope to be used in the toastr.
        var scope = $rootScope.$new();

        // Initialize the scope.
        scope.options = options;
        scope.data = response.data;

        $compile(template)(scope);
        toastr.error(template);

        if(typeof callback !== 'undefined') {
          callback();
        }

      });
    }
  }

})();
