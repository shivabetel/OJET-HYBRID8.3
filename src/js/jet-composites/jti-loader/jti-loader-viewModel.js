/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';
define(
    ['knockout', 'ojL10n!./resources/nls/jti-loader-strings', 'ojs/ojcontext', 'ojs/ojknockout'], function (ko, componentStrings, Context) {
    
    function ExampleComponentModel(context) {
        var self = this;
        
        //At the start of your viewModel constructor
        var busyContext = Context.getContext(context.element).getBusyContext();
        var options = {"description": "Web Component Startup - Waiting for data"};
        self.busyResolve = busyContext.addBusyState(options);

        self.composite = context.element;

        //Example observable
        self.messageText = ko.observable('Hello from jti-loader');
        self.properties = context.properties;
        self.res = componentStrings['jti-loader'];
        // Example for parsing context properties
        // if (context.properties.name) {
        //     parse the context properties here
        // }

        //Once all startup and async activities have finished, relocate if there are any async activities
        self.busyResolve();
        self.contentLoadingCount = ko.observable(0);
        self.showLoader = ko.observable(false);
        self.start = function(isRequired = true) {
          if (isRequired) {
            const counter = self.contentLoadingCount() + 1;
            self.contentLoadingCount(counter);
          }
        }
      
        self.stop = function(isRequired = true) {
          if (isRequired) {
            const counter = self.contentLoadingCount() - 1;
            self.contentLoadingCount(counter);
            if (counter < 0) {
              self.contentLoadingCount(0);
            }
          }
        }
      
        self.reset = function() {
          self.contentLoadingCount(0);
        }

        self.contentLoadingCount.subscribe((counter) => {
          var show = counter > 0;
          self.showLoader(show);
        });
    };
    
    //Lifecycle methods - uncomment and implement if necessary 
    //ExampleComponentModel.prototype.activated = function(context){
    //};

    //ExampleComponentModel.prototype.connected = function(context){
    //};

    //ExampleComponentModel.prototype.bindingsApplied = function(context){
    //};

    //ExampleComponentModel.prototype.disconnect = function(context){
    //};

    //ExampleComponentModel.prototype.propertyChanged = function(context){
    //};

    return ExampleComponentModel;
});