'use strict';

angular.module('phi.system.directives.prettyprint', [])
  .directive('prettyprint', function() {
    return {
      restrict: 'A',
      scope: {
        prettyprint: '='
      },
      link: function postLink(scope, element) {
        var content = scope.prettyprint.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
        element.addClass('prettyprint');
        element.html(prettyPrintOne(content, 'php', false));
      }
    };
  });