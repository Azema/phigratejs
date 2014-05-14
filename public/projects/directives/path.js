'use strict';

angular.module('phi.projects')

// Apply this directive to an element at or below a form that will manage CRUD operations on a resource.
// - The resource must expose the following instance methods: $saveOrUpdate(), $id() and $remove()
.directive('phiPath', ['$compile', '$http', function($compile, $http) {
  return {
    restrict: 'A',
    // We ask this directive to create a new child scope so that when we add helper methods to the scope
    // it doesn't make a mess of the parent scope.
    // - Be aware that if you write to the scope from within the form then you must remember that there is a child scope at the point
    scope: true,
    // We need access to a form so we require a FormController from this element or a parent element
    require: '^form',
    // This directive can only appear as an attribute
    link: function(scope, element, attrs, form) {
      var url = attrs.phiPath;

      function checkPath() {
        var ngModelController = form[attrs.name];
        if (ngModelController.$invalid && ngModelController.$error[attrs.name]) {
          return;
        }
        $http.get(url + encodeURIComponent(ngModelController.$modelValue))
          .success(function(data) {
            ngModelController.$setValidity('checkPath', data.status);
            if (!data.status) {
              showError(data.message);
            }
          })
          .error(function(reason) {
            showError(reason);
            ngModelController.$setValidity('checkPath', false);
          });
      };

      function showError(message) {
        var $containerErrors = element.parent().find('.alert');
        if ($containerErrors.find('.checkPath').length > 0) {
          $containerErrors.find('.checkPath').remove();
        }
        $containerErrors.append('<span data-ng-show="showError(\'config_path\', \'checkPath\')" class="help-block error checkPath">' + message + '</span>');
      }

      // Listen for change events to enable binding
      element.on('blur', function() {
        scope.$apply(checkPath);
      });
    }
  };
}]);

/* vim: set ts=2 sw=2 sts=2 et ai: */
