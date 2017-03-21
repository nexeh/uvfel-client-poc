'use strict';

angular
.module('uvfelClient')
.factory('elasticSearchService', function ($http, $q, $log, baseElasticSearchService) {

    var factory = Object.create(baseElasticSearchService);
    //factory.config = Object.create(baseElasticSearchService.config);

    factory.config = {
        url: 'http://search-uav1-qgtvtkidihqgypbw7r3hcuoqve.us-west-2.es.amazonaws.com/',
        index: 'uav_index',
        search: '_search',
        mapping: '_mapping',
        stats: '_stats',
        clusterStatus: '_cluster/stats',
        documentIndex: 'uav_index',
        documentType: 'None',

        getSearchUrl: function(indexName) {
            return factory.config.url + indexName + '/' +
                factory.config.search + '/';
        },

        getMappingUrl: function(indexName, eventType) {
            return factory.config.url + indexName + '/' +
                factory.config.mapping + '/' + eventType;
        },

        getIndexStatsUrl: function(indexName) {
            return factory.config.url + indexName + '/' +
                factory.config.stats;
        },

        getClusterStatsUrl: function() {
            return factory.config.url + factory.config.clusterStatus;
        }
    };

    factory.latestDevices = {};
    factory.eventData = [];

    factory.getIndexStats = function () {
        var deferred = $q.defer();

        $http.get(factory.config.getIndexStatsUrl(factory.config.index))
            .then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            deferred.resolve(response.data);
          }, function errorCallback(response) {
            $log.error('get request failed to get any data: ', response);
            deferred.resolve(response.data);
          });
        return deferred.promise;
    };

    factory.getClusterStats = function () {
        var deferred = $q.defer();

        $http.get(factory.config.getClusterStatsUrl(factory.config.index))
            .then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            deferred.resolve(response.data);
          }, function errorCallback(response) {
            $log.error('get request failed to get any data: ', response);
            deferred.resolve(response.data);
          });
        return deferred.promise;
    };

    factory.getEventTypeData = function (index, data, fromRecord, eventType, results, deferred, eventSubType) {
        if (!deferred) {
            deferred = $q.defer();
        }

        var queryObj = {
            "size": 10000,
            filter: {
                and: [
                    { "range": { "@timestamp": {} } }
                ]
            },
            "sort": [{ "@timestamp": { "order": "asc" }}]
        };

        if (data.fromDate) {
            queryObj.filter.and[0].range.timestamp.gte = data.fromDate;
        }

        if (data.toDate) {
            queryObj.filter.and[0].range.timestamp.lte = data.toDate;
        }

        if (fromRecord) {
            queryObj.from = fromRecord;
        }

        if (!results) {
            results = [];
        }

        if (eventType.constructor  === Array) {

            queryObj.filter.and.push({"or": []});

            for (var i = 0; i < eventType.length; i++) {
                queryObj.filter.and[2].or.push({"term": {"payload.eventData.data.type": eventType[i]}})
            }

        } else {
            queryObj.filter.and.push({"term":{"payload.eventData.data.type": eventType}});
        }

        if (eventSubType) {
            queryObj.filter.and.push({"term":{"payload.eventData.data.debugData.type": eventSubType}});
        }


        $http.post(factory.config.getSearchUrl(index), queryObj)
            .then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            results = results.concat(response.data.hits.hits);

            if (results.length < response.data.hits.total) {
                var fromNumber = fromRecord | 0;
                factory.getEventTypeData(index, data, fromNumber + response.data.hits.hits.length, eventType, results, deferred);
            } else {
                deferred.resolve(results);
            }

          }, function errorCallback(response) {
            $log.error('get request failed to get any data: ', response);
            deferred.resolve(response.data);
          });
        return deferred.promise;
    };

    return factory;
})
