(function() {
  'use strict';

  angular
    .module('uvfelClient')
    .config(config);

  /** @ngInject */
  function config($logProvider, toastrConfig, $provide) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    var DEFAULT_TIMEZONE = 'EST';

    var getCookie = function (name) {
      var cookie = document.cookie;
      if (cookie) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
      } else {
        return undefined;
      }
    }


    var getTimeZone = function() {

      var cookie;
      var timezone = undefined;
      var cookieString = getCookie("uvfelClient");

      if (cookieString) {
        cookie = angular.fromJson(cookieString);

        if (cookie.timezone) {
          timezone = cookie.timezone;
        }
      }

      return timezone;
    }

    $provide.decorator('dateFilter', ['$delegate', '$injector', function($delegate, $injector) {
       var oldDelegate = $delegate;

       var standardDateFilterInterceptor = function(date, format, timezone) {
         if(angular.isUndefined(timezone)) {
           timezone = getTimeZone();
         }

         return oldDelegate.apply(this, [date, format, timezone]);
       };

       return standardDateFilterInterceptor;
     }]);
  }

})();
