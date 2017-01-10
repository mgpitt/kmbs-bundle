(function() {
  'use strict';
  QueueSetupController.$inject = ["currentKapp", "kapps", "AttributeDefinition", "SpaceModel", "Form", "FormTypes", "Toast", "Slugifier", "$uibModal", "$q", "$scope"];
  angular
    .module('kd.bundle.angular.queue.setup')
    .controller('QueueSetupController', QueueSetupController);

  /* @ngInject */
  function QueueSetupController(currentKapp, kapps, AttributeDefinition, SpaceModel, Form, FormTypes, Toast, Slugifier, $uibModal, $q, $scope) {
    var vm = this;
    var requiredAttributes = [
      { name:'Queue Name', allowsMutliple: false },
      { name: 'Queue Form Type', allowsMutliple: false },
      { name: 'Queue Filters', allowsMutliple: true },
      { name: 'Queue Details Value', allowsMutliple: false },
      { name: 'Queue Summary Value', allowsMutliple: false },
      { name: 'Queue Group Base', allowsMutliple: false },
      { name: 'Queue Setup Visible', allowsMultiple: false}
    ];

    vm.currentKapp = currentKapp;
    vm.kapps = kapps;
    vm.readyToEdit = false;

    vm.queueNameAttribute = {};
    vm.queueSetupVisibleAttribute = {};
    vm.queueTypeAttribute = {};
    vm.queueDetailsAttribute = {};
    vm.queueFilterAttribute = {};
    vm.queueDefaultGroup = {};

    vm.missingAttributes = [];
    vm.missingAdminKapp = false;

    vm.formGeneratorTemplates = [];

    vm.saveKapp = saveKapp;
    vm.generateForm = generateForm;

    vm.form = {
      name: '',
      slug: ''
    };
    vm.shouldSlugify = true;

    vm.setup = {
      addFilter: function() {
        var filterCriteria = {
          name: vm.setup.tmpFilterName,
          qualifications: [],
          order: vm.queueFilterAttribute.values.length
        };

        vm.queueFilterAttribute.values.push(filterCriteria);
        vm.setup.tmpFilterName = '';
        vm.setup.editFilter(filterCriteria);
      },
      isSetupValid: function() {
        return false;
      },


      editFilter: function(filter) {
        var instance = $uibModal.open({
          templateUrl: 'queue/setup/filter.qualification.modal.tpl.html',
          controller: 'FilterQualificationController as vm',
          size: 'lg',
          resolve: {
            filter: function() {
              return angular.copy(filter);
            }
          }
        });

        instance.result.then(
          function(updatedFilter) {
            filter.name = updatedFilter.name;
            filter.qualifications = updatedFilter.qualifications;
            vm.setup.updateFilterOrder();
          }
        );
      },

      removeFilter: function(index) {
        vm.queueFilterAttribute.values.splice(index, 1);
        vm.setup.updateFilterOrder();
      },
      updateFilterOrder: function() {
        var position = 0;
        _.each(vm.queueFilterAttribute.values, function(sortFilter) {
          sortFilter.order = position;
          position++;
        });
      }
    };

    activate();

    function activate() {
      preflightCheck();

      resetForm();

      // Watch the form name field and if slug hasn't been manually modified, set the slug to the new value.
      $scope.$watch('vm.form.name', function(name) {
        if(vm.shouldSlugify) {
          vm.form.slug = name.toLowerCase() || '';
        }
      });

      // Watch the form slug field and if slug has been modified, slugify it.
      $scope.$watch('vm.form.slug', function(slug) {
        vm.form.slug = Slugifier.slugify(slug);
      });
    }

    function resetForm() {
      vm.form.slug = '';
      vm.form.name = '';
    }

    function preflightCheck() {
      checkForAdminKapp().then(
        function() {
          getMissingAttributeDefinitions().then(
            function(missingAttributes) {
              // Save the missing attributes.
              vm.missingAttributes = missingAttributes;

              _handleMissingAttributeDefinitions().then(
                function(ready) {
                  // What next?
                  if(ready) {
                    vm.readyToEdit = true;
                    setupConfigurationObject();
                    populateDefaultTemplates().then(
                      function() {
                        Form.build(vm.currentKapp.slug).getList().then(
                          function(forms) {
                            vm.formGeneratorTemplates = _.filter(forms, {type:'Template'});
                          },
                          function() {
                            Toast.error('Failed to retrieve existing form when creating default templates.');
                          }
                        )
                      }, function() {
                        Toast.error('Creating default forms failed!')
                      }
                    );
                  }
                },
                function() {
                  return $q.reject();
                }
              )

            },
            function() {
              Toast.error('Failed to determine setup status!')
            }
          )
        },
        // If the admin kapp check fails.
        function() {
          vm.missingAdminKapp = true;
        }
      );


    }

    function checkForAdminKapp() {
      var deferred = $q.defer();
      SpaceModel.current().get({include: 'attributes'}).then(
        function(space) {
          if(!_.some(space.attributes, {name:'Admin Kapp Slug'})) {
            deferred.reject();
          }
          deferred.resolve();
        },
        function() {
          deferred.reject();
        }
      );
      return deferred.promise;
    }

    function getMissingAttributeDefinitions() {
      var deferred = $q.defer();

      AttributeDefinition.build('Kapp', vm.currentKapp.slug).getList().then(
        function(attributeDefinitions) {
          // Next we'll go through all of the required attributes and make sure
          // that we create an attribute definition for each of the missing ones.
          var definitionsToCreate = [];
          _.each(requiredAttributes, function(definition) {
            if(!_.some(attributeDefinitions, {name:definition.name})) {
              definitionsToCreate.push({name: definition.name, created: false, definition: definition});
            }
          });
          deferred.resolve(definitionsToCreate);
        },
        function() {
          deferred.reject();
        }
      );

      return deferred.promise;
    }

    function _handleMissingAttributeDefinitions() {
      var deferred = $q.defer();

      // If there were any missing attributes...
      if(vm.missingAttributes.length > 0) {
        var promises = _.map(vm.missingAttributes, function(attributeDefinition) {
          return createAttributeDefinition(attributeDefinition)
        });
        $q.all(promises).then(
          function() {
            Toast.success('Created all missing attribute definitions.');
            deferred.resolve(true);
          },
          function() {
            Toast.error('Failed to create missing attribute definitions.');
            deferred.reject();
          }
        )
      } else {
        deferred.resolve(true);
      }

      return deferred.promise;
    }

    function createAttributeDefinition(attributeDefinition) {
      var deferred = $q.defer();

      //if(attributeDefinitions.length > 0) {
      //  var newDefinition = attributeDefinitions.pop();
      AttributeDefinition
        .build('Kapp', vm.currentKapp.slug)
        .post(attributeDefinition.definition)
        .then(
        function(result) {
          attributeDefinition.created = true;
          deferred.resolve(result);
        }, function(error) {
          Toast.error('Failed to create required attribute definition "'+definition+'".');
          deferred.reject(error);
        }
      );
      return deferred.promise;
    }

    function populateDefaultTemplates() {
      var deferred = $q.defer();
      Form.build(vm.currentKapp.slug).getList().then(
        function(forms) {
          var templatesToCreate = [];

          // Check all template slugs, see if any are missing.
          _.each(TEMPLATE_SLUGS, function(templateSlug) {
            if(!_.some(forms, {slug: templateSlug})) {
              templatesToCreate.push(templateSlug);
            }
          });

          if(templatesToCreate.length < 1) {
            deferred.resolve();
          } else {
            var promises = _.map(templatesToCreate, function(templateSlug) {
              return populateDefaultTemplate(templateSlug)
            });
            $q.all(promises).then(
              function() {
                deferred.resolve();
              },
              function() {
                deferred.reject();
              }
            )
          }

        },
        function() {
          deferred.reject();
        }
      );
      return deferred.promise;
    }

    function populateDefaultTemplate(templateSlug) {
      var deferred = $q.defer();
      Form.build(vm.currentKapp.slug).post(
        generateFormTemplate(templateSlug)
      ).then(
        function() {
          // Generated the new form template. Resolve.
          deferred.resolve();
        },
        function() {
          // Failed to generate the new form template. Reject!
          deferred.reject();
        }
      );

      return deferred.promise;
    }

    function saveKapp() {
      // Convert the filters to a string.
      vm.queueFilterAttribute.values = _.map(vm.queueFilterAttribute.values, function(filter) {
        return JSON.stringify(filter, function(key, value) { return (_.startsWith(key, '$$') ? undefined : value); });
      });

      vm.currentKapp.put().then(
        function() {
          setupConfigurationObject();
          addFormType().then(
            function() {
              Toast.success('Updated Kapp configuration.');
            },
            function() {
              Toast.error('Failed to update Kapp configuration!');
            }
          );
        }
      );
    }

    function generateForm() {

      // Check the forms to make sure it doesn't already exist.
      Form.build(vm.currentKapp.slug).getList().then(
        function(forms) {
          if(_.some(forms, {slug: vm.form.slug})) {
            Toast.error('Form "'+vm.form.slug+'" already exists!')
          } else {
            // Next get the form we'll be cloning.
            Form.build(currentKapp.slug).one(vm.formTemplate.slug).get({include: 'details,attributes,pages,categorizations,securityPolicies,bridgedResources,customHeadContent'}).then(
              function(formTemplate) {
                // Update the form template with the new slug, etc.
                formTemplate.slug = vm.form.slug;
                formTemplate.name = vm.form.name;
                formTemplate.type = vm.queueTypeAttribute.values[0];

                // TODO: Are there other things we should be adding? Categories or something?

                // Create the new form.
                Form.build(vm.currentKapp.slug).post(
                  formTemplate
                ).then(
                  function() {
                    Toast.success('Generated new form!');
                    resetForm();
                  },
                  function() {
                    Toast.error('Failed to create form!');
                  }
                );
              },
              function() {
                Toast.error('Failed to retrieve form template to clone.')
              }
            );
          }
        },
        function() {
          Toast.error('Failed to verify form uniqueness.')
        }
      );
    }

    function addFormType() {
      var deferred = $q.defer();

      FormTypes.build(vm.currentKapp.slug).getList().then(
        function(formTypes) {
          if(_.some(formTypes, {name: vm.queueTypeAttribute.values[0]})) {
            deferred.resolve();
          } else {
            FormTypes.build(vm.currentKapp.slug).post({name: vm.queueTypeAttribute.values[0]}).then(
              function() {
                deferred.resolve();
              },
              function() {
                deferred.reject();
              }
            );
          }
        },
        function() {
          deferred.reject();
        }
      );

      return deferred.promise;
    }

    function setupConfigurationObject() {
      vm.queueNameAttribute = _.find(vm.currentKapp.attributes, {name: 'Queue Name'});
      if(_.isEmpty(vm.queueNameAttribute)) {
        vm.queueNameAttribute = { name: 'Queue Name', values: [''] };
        vm.currentKapp.attributes.push(vm.queueNameAttribute);
      }
      vm.queueSetupVisibleAttribute = _.find(vm.currentKapp.attributes, {name: 'Queue Setup Visible'});
      if(_.isEmpty(vm.queueSetupVisibleAttribute)) {
        vm.queueSetupVisibleAttribute = { name: 'Queue Setup Visible', values: ['true'] };
        vm.currentKapp.attributes.push(vm.queueSetupVisibleAttribute);
      } else {
        vm.queueSetupVisibleAttribute.values[0] = ''+vm.queueSetupVisibleAttribute.values[0];
      }
      vm.queueTypeAttribute = _.find(vm.currentKapp.attributes, {name: 'Queue Type'});
      if(_.isEmpty(vm.queueTypeAttribute)) {
        vm.queueTypeAttribute = { name: 'Queue Type', values: [''] };
        vm.currentKapp.attributes.push(vm.queueTypeAttribute);
      }
      vm.queueDetailsAttribute = _.find(vm.currentKapp.attributes, {name: 'Queue Details Value'});
      if(_.isEmpty(vm.queueDetailsAttribute)) {
        vm.queueDetailsAttribute = { name: 'Queue Details Value', values: [''] };
        vm.currentKapp.attributes.push(vm.queueDetailsAttribute);
      }
      vm.queueSummaryAttribute = _.find(vm.currentKapp.attributes, {name: 'Queue Summary Value'});
      if(_.isEmpty(vm.queueSummaryAttribute)) {
        vm.queueSummaryAttribute = { name: 'Queue Summary Value', values: [''] };
        vm.currentKapp.attributes.push(vm.queueSummaryAttribute);
      }
      vm.queueGroupBase = _.find(vm.currentKapp.attributes, {name: 'Queue Group Base'});
      if(_.isEmpty(vm.queueGroupBase)) {
        vm.queueGroupBase = { name: 'Queue Group Base', values: []};
        vm.currentKapp.attributes.push(vm.queueGroupBase);
      }
      vm.queueFilterAttribute = _.find(vm.currentKapp.attributes, {name: 'Queue Filters'});
      if(_.isEmpty(vm.queueFilterAttribute)) {
        vm.queueFilterAttribute = { name: 'Queue Filters', values: [] };
        vm.currentKapp.attributes.push(vm.queueFilterAttribute);
      } else {
        vm.queueFilterAttribute.values = _.map(vm.queueFilterAttribute.values, function(filter) {
          if(typeof filter === 'string') {
            return JSON.parse(filter);
          }
          return filter;
        });
      }
    }

    var TEMPLATE_SLUGS = [
      'basic-queue-item-template',
      'queue-item-from-service-item'
    ];
    var TEMPLATES = {
      'basic-queue-item-template': {
        "anonymous": false,
        "attributes": [],
        "bridgedResources": [],
        "categorizations": [],
        "customHeadContent": null,
        "description": "This template is of a basic queue item. All elements in Hidden Metadata and Status Information are required for the Queue to function.",
        "name": 'Basic Queue Item Template',
        "notes": null,
        "pages": [
          {
            "advanceCondition": null,
            "displayCondition": null,
            "displayPage": null,
            "elements": [
              {
                "type": "section",
                "renderType": null,
                "name": "Hidden Metadata",
                "title": "",
                "visible": false,
                "omitWhenHidden": false,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Assigned Individual",
                    "label": "Assigned Individual",
                    "key": "f3",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Assigned Individual Display Name",
                    "label": "Assigned Individual Display Name",
                    "key": "f4",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Assigned Group",
                    "label": "Assigned Group",
                    "key": "f6",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Assigned Group Display Name",
                    "label": "Assigned Group Display Name",
                    "key": "f7",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Deferral Token",
                    "label": "Deferral Token",
                    "key": "f8",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  }
                ]
              },
              {
                "type": "section",
                "renderType": null,
                "name": "Status Information",
                "title": "Status Information",
                "visible": true,
                "omitWhenHidden": null,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Due Date",
                    "label": "Due Date",
                    "key": "f5",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "date"
                  },
                  {
                    "type": "field",
                    "name": "Status",
                    "label": "Status",
                    "key": "f2",
                    "defaultValue": "Open",
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": true,
                    "requiredMessage": "A valid status must be set.",
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "dropdown",
                    "choicesResourceName": null,
                    "choicesRunIf": null,
                    "choices": [
                      {
                        "label": "Open",
                        "value": "Open"
                      },
                      {
                        "label": "Pending",
                        "value": "Pending"
                      },
                      {
                        "label": "In Progress",
                        "value": "In Progress"
                      },
                      {
                        "label": "Complete",
                        "value": "Complete"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "section",
                "renderType": null,
                "name": "Item Details",
                "title": "Item Details",
                "visible": true,
                "omitWhenHidden": null,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Task",
                    "label": "Task",
                    "key": "f1",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  }
                ]
              },
              {
                "type": "button",
                "label": "Save",
                "name": "Save",
                "visible": true,
                "enabled": true,
                "renderType": "save",
                "renderAttributes": {}
              },
              {
                "type": "button",
                "label": "Complete",
                "name": "Complete",
                "visible": true,
                "enabled": true,
                "renderType": "submit-page",
                "renderAttributes": {}
              }
            ],
            "events": [],
            "name": "Page One",
            "renderType": "submittable",
            "type": "page"
          },
          {
            "advanceCondition": null,
            "displayCondition": null,
            "displayPage": null,
            "elements": [],
            "events": [],
            "name": "Confirmation",
            "renderType": "confirmation",
            "type": "page"
          }
        ],
        "securityPolicies": [],
        "slug": 'basic-queue-item-template',
        "status": "New",
        "submissionLabelExpression": "${form('name')}",
        "type": "Template"
      },
      'queue-item-from-service-item': {
        "anonymous": false,
        "attributes": [],
        "bridgedResources": [],
        "categorizations": [],
        "customHeadContent": null,
        "description": "This queue item templates is for items which will be created from service item submissions.",
        "name": "Queue Item From Service Item",
        "notes": null,
        "pages": [
          {
            "advanceCondition": null,
            "displayCondition": null,
            "displayPage": null,
            "elements": [
              {
                "type": "section",
                "renderType": null,
                "name": "Hidden Metadata",
                "title": "",
                "visible": false,
                "omitWhenHidden": false,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Assigned Individual",
                    "label": "Assigned Individual",
                    "key": "f3",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Assigned Individual Display Name",
                    "label": "Assigned Individual Display Name",
                    "key": "f4",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Assigned Group",
                    "label": "Assigned Group",
                    "key": "f6",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Assigned Group Display Name",
                    "label": "Assigned Group Display Name",
                    "key": "f7",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Deferral Token",
                    "label": "Deferral Token",
                    "key": "f8",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  }
                ]
              },
              {
                "type": "section",
                "renderType": null,
                "name": "Requestor Information",
                "title": "Requestor Information",
                "visible": true,
                "omitWhenHidden": null,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Requested By",
                    "label": "Requested By",
                    "key": "f9",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": false,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Requested By Display Name",
                    "label": "Requested By Display Name",
                    "key": "f10",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": false,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Requested For",
                    "label": "Requested For",
                    "key": "f11",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": false,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  },
                  {
                    "type": "field",
                    "name": "Requested For Display Name",
                    "label": "Requested For Display Name",
                    "key": "f12",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": false,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  }
                ]
              },
              {
                "type": "section",
                "renderType": null,
                "name": "Status Information",
                "title": "Status Information",
                "visible": true,
                "omitWhenHidden": null,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Due Date",
                    "label": "Due Date",
                    "key": "f5",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "date"
                  },
                  {
                    "type": "field",
                    "name": "Status",
                    "label": "Status",
                    "key": "f2",
                    "defaultValue": "Open",
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": true,
                    "requiredMessage": "A valid status must be set.",
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "dropdown",
                    "choicesResourceName": null,
                    "choicesRunIf": null,
                    "choices": [
                      {
                        "label": "Open",
                        "value": "Open"
                      },
                      {
                        "label": "Pending",
                        "value": "Pending"
                      },
                      {
                        "label": "In Progress",
                        "value": "In Progress"
                      },
                      {
                        "label": "Complete",
                        "value": "Complete"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "section",
                "renderType": null,
                "name": "Item Details",
                "title": "Item Details",
                "visible": true,
                "omitWhenHidden": null,
                "renderAttributes": {},
                "elements": [
                  {
                    "type": "field",
                    "name": "Task",
                    "label": "Task",
                    "key": "f1",
                    "defaultValue": null,
                    "defaultResourceName": null,
                    "visible": true,
                    "enabled": true,
                    "required": false,
                    "requiredMessage": null,
                    "omitWhenHidden": null,
                    "pattern": null,
                    "constraints": [],
                    "events": [],
                    "renderAttributes": {},
                    "dataType": "string",
                    "renderType": "text",
                    "rows": 1
                  }
                ]
              },
              {
                "type": "button",
                "label": "Save",
                "name": "Save",
                "visible": true,
                "enabled": true,
                "renderType": "save",
                "renderAttributes": {}
              },
              {
                "type": "button",
                "label": "Complete",
                "name": "Complete",
                "visible": true,
                "enabled": true,
                "renderType": "submit-page",
                "renderAttributes": {}
              }
            ],
            "events": [],
            "name": "Page One",
            "renderType": "submittable",
            "type": "page"
          },
          {
            "advanceCondition": null,
            "displayCondition": null,
            "displayPage": null,
            "elements": [],
            "events": [],
            "name": "Confirmation",
            "renderType": "confirmation",
            "type": "page"
          }
        ],
        "securityPolicies": [],
        "slug": "queue-item-from-service-item",
        "status": "New",
        "submissionLabelExpression": "${form('name')}",
        "type": "Template"
      }
    };

    function generateFormTemplate(templateSlug) {
      return TEMPLATES[templateSlug];
    }
  }
}());
