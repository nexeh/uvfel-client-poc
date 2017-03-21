angular.module('uvfelClient').service('ChartService',
    [

    function () {

        this.plotOptions = [];

        this.plotSelection = [];

        /**
         * Generates a unique Id for a chart.
         */
        this.generateChartId = function () {
            return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
                var num = Math.random() *16 | 0, v = c === 'x' ? num : (num&0x3|0x8);
                return v.toString(16);
            });
        };

        /**
         *  Returns a highcharts config with some default options as a starting point. Mixin the
         *  passed configuration.
         */
        this.getChartConfig = function (config) {

            var defaultConfig = {
                chart: {
                    marginLeft: 80,
                    marginRight: 80,
                    zoomType: 'x'
                },
                title: null,

                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        turboThreshold: 0
                    }
                },

                xAxis: {
                    type: 'datetime',
                    title: {
                        text: 'Date (Local)'
                    }
                },

                navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },

                credits: {
                    enabled: false
                }
            };

            return angular.merge({}, defaultConfig, config);
        };

        this.chartTypeList = [
        ];


        this.getChartList = function () {
            return this.chartTypeList;
        };

        this.getChartType = function (currentChartType) {

            var chartList = this.getChartList();
            currentChartType = angular.fromJson(currentChartType);

            for (var i = 0; i < chartList.length; i++) {

                var chart = chartList[i];

                if (chart.name === currentChartType.name) {
                    return chart;
                }
            }
        };

    }]);