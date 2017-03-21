(function() {
  'use strict';

  angular.module('uvfelClient')
    .directive('chart', chart);

  /** @ngInject */
  function chart() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/chart/chart.html',
      scope: {
          config: '='
      },
      controller: ChartController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function ChartController($scope, $timeout, elasticSearchService) {

        /**
         * Highlight a point by showing tooltip, setting hover state and draw crosshair
         */
        Highcharts.Point.prototype.highlight = function (event) {
            this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        /**
         * Synchronize zooming through the setExtremes event handler.
         */
        function syncExtremes(e) {
            var thisChart = this.chart;

            if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
                Highcharts.each(Highcharts.charts, function (chart) {

                    // TODO JC When we "update chart" in the option menu it creates new chart objects
                    // and highcharts has a reference to undefined for the original

                    if (!chart) {
                      return;
                    }

                    if (chart !== thisChart) {
                        if (chart.xAxis[0].setExtremes) { // It is null while updating
                            chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                        }
                    }
                });
            }
        }

        $scope.selectAll = function (optionName) {
          $scope.vm.config[optionName + 'Selection'] = angular.copy($scope.vm.config[optionName + 'Options']);
        };

        $scope.unselectAll = function (optionName) {
          $scope.vm.config[optionName + 'Selection'].length = 0;
        };

        $scope.applyOptionChange = function () {
          $scope.vm.config.options.height = $scope.vm.config.optionsTemp.height;
          $timeout(
            function(){
              $scope.vm.config.chart.reflow();
            }, 1);
        };

        $scope.toggleSelection = function toggleSelection(optionValue, optionName) {

          // There is not always a initialized section for every selection
          // TODO JC should this be done somewhere else to prvent us from chasing the problem for multiple sides?
          if (!$scope.vm.config[optionName + 'Selection']) {
            $scope.vm.config[optionName + 'Selection'] = [];
          }

          var idx = $scope.vm.config[optionName + 'Selection'].indexOf(optionValue);

          // is currently selected
          if (idx > -1) {
            $scope.vm.config[optionName + 'Selection'].splice(idx, 1);
          }

          // is newly selected
          else {
            $scope.vm.config[optionName + 'Selection'].push(optionValue);
          }
        };

        $scope.updateChart = function() {

          var selectedChartType = $scope.vm.config.chartType;

          if ($scope.vm.config.chart) {
            $scope.vm.config.chart.showLoading();
          }

          $scope.vm.config.eventData = angular.copy(selectedChartType.series);

          selectedChartType.getRemoteData(elasticSearchService.config.index, $scope.vm.config.filterData, $scope.vm.config.eventData, $scope.vm.config).then(function () {
            $scope.vm.config.generateEventChart($scope.vm.config);
              if ($scope.vm.config.chart) {
                $scope.vm.config.chart.hideLoading();
              }
          });

          $scope.vm.config.generateEventChart($scope.vm.config);
        }

        $scope.togglePlotOption = function(optionName) {
          $scope.vm.config.options[optionName] = !$scope.vm.config.options[optionName];
          $scope.vm.config.generateEventChart($scope.vm.config);
        }
    }
  }

})();
