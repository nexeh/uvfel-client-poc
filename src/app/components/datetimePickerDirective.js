'use strict';

angular.module('uvfelClient')
    .directive('dekaDatetimePicker', function () {
      return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, elem, attrs, ngModelCtrl) {
          var updateModel = function (e) {
            scope.$apply(function () {
              ngModelCtrl.$viewValue = e.date.valueOf();
              ngModelCtrl.$commitViewValue();
            });
          };
          elem.datetimepicker({
            useCurrent: false
          });
          elem.on("dp.change",function (e) {
            updateModel(e);
          });
        }
      }
    });