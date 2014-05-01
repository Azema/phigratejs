'use strict';

angular.module('phi.system')
.factory('phiLoading', [
  '$document',
  'phiTemplateLoader',
  'phiAnimate',
  'phiBackdrop',
  '$timeout',
  '$q',
  '$log',
  '$compile',
function($document, phiTemplateLoader, phiAnimate, phiBackdrop, $timeout, $q, $log, $compile) {

  var loaderInstance;
  //default value
  var loadingShowDelay = $q.when();

  var options = {template: '<div class="loading"></div>'};

  return {
    setOptions: setOptions,
    /**
     * @ngdoc method
     * @name $ionicLoading#show
     * @description Shows a loading indicator. If the indicator is already shown,
     * it will set the options given and keep the indicator shown.
     * @param {object} opts The options for the loading indicator. Available properties:
     *  - `{string=}` `template` The html content of the indicator.
     *  - `{string=}` `templateUrl` The url of an html template to load as the content of the indicator.
     *  - `{boolean=}` `noBackdrop` Whether to hide the backdrop.
     *  - `{number=}` `delay` How many milliseconds to delay showing the indicator.
     *  - `{number=}` `duration` How many milliseconds to wait until automatically
     *  hiding the indicator.
     */
    show: showLoader,
    /**
     * @ngdoc method
     * @name $ionicLoading#hide
     * @description Hides the loading indicator, if shown.
     */
    hide: hideLoader,
    isShow: loaderShowing,
    /**
     * @private for testing
     */
    _getLoader: getLoader
  };

  function getLoader() {
    if (!loaderInstance) {
      loaderInstance = phiTemplateLoader.compile({
        template: options.template,
        appendTo: $document[0].body
      })
      .then(function(loader) {

        var self = loader;

        loader.show = function(options) {
          var templatePromise = options.templateUrl ?
            phiTemplateLoader.load(options.templateUrl) :
            //options.content: deprecated
            $q.when(options.template || options.content || '');


          if (!this.isShown) {
            //options.showBackdrop: deprecated
            this.hasBackdrop = !options.noBackdrop && options.showBackdrop !== false;
            if (this.hasBackdrop) {
              phiBackdrop.retain();
            }
          }

          if (options.duration) {
            $timeout.cancel(this.durationTimeout);
            this.durationTimeout = $timeout(
              angular.bind(this, this.hide),
              +options.duration
            );
          }

          templatePromise.then(function(html) {
            if (html) {
              self.element.html(html);
              $compile(self.element.contents())(self.scope);
            }

            var centerElementByMargin = function(el) {
              el.style.marginLeft = (-el.offsetWidth) / 2 + 'px';
              el.style.marginTop = (-el.offsetHeight) / 2 + 'px';
            };

            var centerElementByMarginTwice = function(el) {
              phiAnimate(function() {
                centerElementByMargin(el);
                phiAnimate(function() {
                  centerElementByMargin(el);
                });
              });
            };

            //Don't show until template changes
            if (self.isShown) {
              self.element.addClass('visible');
              centerElementByMarginTwice(self.element[0]);
              phiAnimate(function() {
                self.isShown && self.element.addClass('active');
              });
            }
          });

          this.isShown = true;
        };
        loader.hide = function() {
          if (this.isShown) {
            if (this.hasBackdrop) {
              phiBackdrop.release();
            }
            self.element.removeClass('active');
            setTimeout(function() {
              !self.isShown && self.element.removeClass('visible');
            }, 200);
          }
          $timeout.cancel(this.durationTimeout);
          this.isShown = false;
        };
        loader.isShow = function() {
          return this.isShow;
        };
        return loader;
      });
    }
    return $q.when(loaderInstance);
  }

  function setOptions(pOptions) {
    angular.extend(options, pOptions);
  }

  function showLoader(options) {
    options || (options = {});
    var delay = options.delay || options.showDelay || 0;

    //If loading.show() was called previously, cancel it and show with our new options
    $timeout.cancel(loadingShowDelay);
    loadingShowDelay = $timeout(angular.noop, delay);

    loadingShowDelay.then(getLoader).then(function(loader) {
      return loader.show(options);
    });
  }

  function hideLoader() {
    $timeout.cancel(loadingShowDelay);
    getLoader().then(function(loader) {
      loader.hide();
    });
  }

  function loaderShowing() {
    getLoader().then(function(loader) {
      return loader.isShow();
    });
  }
}]);