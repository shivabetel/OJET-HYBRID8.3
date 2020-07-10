/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcomposite', 'text!./jti-loader-view.html', './jti-loader-viewModel', 'text!./component.json', 'css!./jti-loader-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('jti-loader', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);