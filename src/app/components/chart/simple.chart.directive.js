(function() {
   'use strict';

    angular.module('uvfelClient')
    // Directive for generic chart, pass in chart options
    .directive('simplechart', simpleChart);

    /** @ngInject */
    function simpleChart($timeout) {
        return {
            restrict: 'E',
            template: '<div class="col-md-12"></div>',
            scope: {
                options: '='
            },
            link: function (scope, element) {

                var chartReference = null;
                $timeout(function() {
                    chartReference = Highcharts.chart(element[0], scope.options);
                    scope.$parent.charts.push(chartReference)
                }, 10);

                element.on('$destroy', function() {
                    chartReference.destroy();
                });

                scope.$watch('options.series', function(newValue, oldValue) {
                    console.log("watch fired")
                    if (chartReference) {
                        console.log("Update Called")
                        chartReference.update(scope.options);
                    }
                }, true);

            }
        };
    }
})();