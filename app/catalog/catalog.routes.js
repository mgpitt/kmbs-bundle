(function() {
  'use strict';

  angular
    .module('kd.bundle.angular.catalog')
    .config(routes);

  /* @ngInject */
  function routes($stateProvider) {
    $stateProvider.state('catalog', {
      parent: 'default',
      url: '/catalog',

      views: {
        '': {
          templateUrl: 'catalog/catalog.tpl.html',
          controller: 'CatalogController as vm',
          resolve: {
            forms: function(kappSlug, Form) {
              return Form.build(kappSlug).getList({include: 'attributes'});
            }
            // approvals: function(Submission) {
            //   return Submission.search('catalogng', 'new-server-request')
            //     .eq('values[Text Message]', 'tests')
            //     .sortBy('createdAt')
            //     .includes(['values','details'])
            //     .execute();
            // }
          }
        }
      }
    });

    $stateProvider.state('catalog.form', {
      url: '/form/{formSlug}',

      views: {
        '': {
          templateUrl: 'catalog/form.tpl.html',
          controller: 'FormController as vm',
          resolve: {
            formSlug: function($stateParams) {
              return $stateParams.formSlug;
            },
            form: function(kappSlug, formSlug, Form) {
              return Form.build(kappSlug).one(formSlug).get({include: 'attributes'});
            }
          }
        }
      }
    });
  }
})();
