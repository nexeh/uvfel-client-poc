(function() {
  'use strict';

  angular
    .module('uvfelClient')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main',
        activeTab: "home"
      })

    $urlRouterProvider.otherwise('/');
  }

})();
