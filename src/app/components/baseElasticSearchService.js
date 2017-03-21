'use strict';

angular
.module('uvfelClient')
.factory('baseElasticSearchService', function ($http, $q, $log) {

    var factory = {};

    factory.config = {
        url: 'http://search-uav1-qgtvtkidihqgypbw7r3hcuoqve.us-west-2.es.amazonaws.com/',
        search: '_search',
        mapping: '_mapping',
        stats: '_stats',
        clusterStatus: '_cluster/stats'
    };


    /**
     *
     * This function will return the document type. It wil return the configured document type
     * unless another document type is passed. This is useful for simple services that dont have
     * multiple type but the flexibility for ones that have multiple.
     *
     */
    factory.getDocumentType = function(config, documentType) {

        // The document type is defined and is not empty we will use it
        if (documentType && documentType !== '') {
            return documentType;
        }

        // returns what was configured in the service at creation time
        return config.documentType;
    }

    /**
     *
     * Returns a XXX URL as a string using the configuration of the service. Each service should
     * be overiding the default configutation to make this work for everyone
     *
     */
    factory.getSearchUrl = function(config, indexName) {
        factory.validateConfiguration(config);
        return config.url + indexName + '/' + config.search + '/';
    };


    /**
     *
     * Returns a XXX URL as a string using the configuration of the service. Each service should
     * be overiding the default configutation to make this work for everyone
     *
     */
    factory.getDocumentUrl = function(config, indexName, type, id) {
        factory.validateConfiguration(config);
        return config.url + indexName + '/' + type + "/" + id;
    };


    /**
     *
     * Returns a XXX URL as a string using the configuration of the service. Each service should
     * be overiding the default configutation to make this work for everyone
     *
     */
    factory.createDocumentUrl = function(config, indexName, type, id) {

        factory.validateConfiguration(config);
        var url = config.url + indexName + '/' + type;

        if (id && id !== '') {
           url += "/" + id;
        }

        return url;
    };


    /**
     *
     * Returns a XXX URL as a string using the configuration of the service. Each service should
     * be overiding the default configutation to make this work for everyone
     *
     */
    factory.updateDocumentUrl = function(config, indexName, type, id, version) {

        var url = factory.getDocumentUrl(config, indexName, type, id);

        if (version && version !== '') {
           url += "?_version=" + version;
        }

        return url;
    };


    /**
     *
     * Returns a XXX URL as a string using the configuration of the service. Each service should
     * be overiding the default configutation to make this work for everyone
     *
     */
    factory.deleteDocumentUrl = function(config, indexName, type, id) {
        return factory.getDocumentUrl(config, indexName, type, id);
    };

    /**
     *
     * This function is used to look at the configuration of the service and make sure that the
     * child service has configured expected fields. IF they are not configured then it will log
     * messaged to the developer in the console.
     *
     */
    factory.validateConfiguration = function(config) {

        var requiredConfigAttributes = [
            "url", "documentIndex", "documentType"
        ];

        for (var i = 0; i < requiredConfigAttributes.length; i++) {

            var attribute = requiredConfigAttributes[i];

            if (!config[attribute] || config[attribute] === '') {
                $log.error("config." + attribute + "is not configured.");
            }
        }
    };


    /**
     *
     * Get a single document from elastic search
     *
     */
    factory.getDocument = function(config, documentId, documentType) {

        var deferred = $q.defer();

        var url = factory.getDocumentUrl(config, config.documentIndex, factory.getDocumentType(config, documentType), documentId);

        $http.get(url).then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            deferred.resolve(response.data);
          }, function errorCallback(response) {
            $log.error('Get request failed. URL: {}' + url, response);
            deferred.reject(response.data);
          });

        return deferred.promise;
    };


    /**
     *
     * Update a document
     *
     */
    factory.updateDocument = function(config, documentId, document, versionNumber, documentType) {

        var deferred = $q.defer();
        var url = factory.updateDocumentUrl(config, config.documentIndex, factory.getDocumentType(config, documentType), documentId, versionNumber);

        $http.put(url, document).then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            deferred.resolve(response.data);
          }, function errorCallback(response) {
            $log.error('Failed to update document. {}' + url, response);
            deferred.reject(response.data);
          });

        return deferred.promise;
    };


    /**
     *
     * Create a document
     *
     */
    factory.createDocument = function(config, document, documentId, documentType) {

        var deferred = $q.defer();
        var url = factory.createDocumentUrl(config, config.documentIndex, factory.getDocumentType(config, documentType), documentId)

        $http.post(url, document).then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            deferred.resolve(response.data);
          }, function errorCallback(response) {
            $log.error('Failed to create document. {}' + url, response);
            deferred.reject(response.data);
          });

        return deferred.promise;
    };


    /**
     *
     * Delete a document
     *
     */
    factory.deleteDocument = function(config, documentId, documentType) {

        var deferred = $q.defer();
        var url = factory.deleteDocumentUrl(config, config.documentIndex, factory.getDocumentType(config, documentType), documentId);

        $http.delete(url).then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            deferred.resolve(response.data);
          }, function errorCallback(response) {
            $log.error('Failed to delete document. ' + url, response);
            deferred.reject(response.data);
          });

        return deferred.promise;
    };


    /**
     *
     * Searches the index for documents using the given query json object.
     *
     */
    factory.searchDocuments = function(config, queryObj) {
        var deferred = $q.defer();

        if (!queryObj || queryObj === '') {
            queryObj = {
                size: 1000
            }
        }

        $http.post(factory.getSearchUrl(config, config.documentIndex), queryObj)
            .then(function successCallback(response) {

            deferred.resolve(response.data.hits.hits);
          }, function errorCallback(response) {
            $log.error('Failed to create dashboard: ', response);
            deferred.reject(response.data);
          });

        return deferred.promise;
    }

    /**
     *
     * Returned the unique values in a field.
     *
     */
    factory.getUniqueFieldValues = function(config, index, agg_name, field_name) {
        var deferred = $q.defer();

        var queryObj = {
            "size": 1,
            "aggregations": {}
        };

        queryObj.aggregations[agg_name] = {
            "terms": {
                "size": 0,
                "field": field_name
            }
        };

        $http.post(factory.getSearchUrl(config, config.documentIndex), queryObj)
            .then(function successCallback(response) {

            if(!response) {
                response = {data: []};
            }

            var buckets = response.data.aggregations[agg_name].buckets;
            var bucketKeys = buckets.map(function extractKey(bucket) { return bucket["key"] });

            deferred.resolve(bucketKeys);
          }, function errorCallback(response) {
            $log.error('get request failed to get any data: ', response);
            deferred.resolve(response.data);
          });
        return deferred.promise;
    };

    return factory;
});
