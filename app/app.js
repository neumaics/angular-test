angular.module('interview', ['ngRoute'])
    .factory('PhotoDataService', ['$http', function($http) {
      var cityData;
      var cityMap = {};

      var resolveCityData = $http.get('http://mqlocal.aol.com/photos').success(function(data){
        cityData = formatCityData(data);
      });

      function formatCityData(data) {
        var formatted = [];

        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          d.description = data[i].description.replace(data[i].id, '').trim()
          cityMap[d.description.toLowerCase()] = d.id;
          formatted.push(d);
        }

        return formatted;
      }

      function getCityDetails(id, success, fail) {
        if(id.match(/[0-9]{9}/g) !== null) { //Numeric ID was passed
          $http.get('http://mqlocal.aol.com/photos/' + id).success(success);
        } else if (cityMap[id.toLowerCase()] !== undefined){ //Some other id was passed, check it.
          $http.get('http://mqlocal.aol.com/photos/' + cityMap[id.toLowerCase()]).success(success);
        } else {
          fail();
        }
      }

      var service = {};
      
      service.resolveCityData = resolveCityData;
      service.getCityData = function() { return cityData; };
      service.getCityDetails = getCityDetails;

      return service;
      }])
    .controller('HomeCtrl', ['$scope', 'PhotoDataService', 
      function($scope, PhotoDataService) {
        $scope.cities = PhotoDataService.getCityData();
      }])
    .controller('CityCtrl', ['$scope', '$routeParams', 'PhotoDataService',
      function($scope, $routeParams, PhotoDataService) {
        $scope.id = $routeParams.id;
        $scope.data;

        PhotoDataService.getCityDetails($routeParams.id, function(data) { 
          console.log(data);
          $scope.data = data; 
        });

      }])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/city/:id', {
            templateUrl: 'app/city/city.html',
            controller: 'CityCtrl',
            resolve: {
              'cityData': function(PhotoDataService) { return PhotoDataService.resolveCityData; }
            } 
          }
        )
        .otherwise({
          templateUrl: 'app/home/home.html',
          controller: 'HomeCtrl',
          resolve: {
              'cityData': function(PhotoDataService) { return PhotoDataService.resolveCityData; }
          } 
      });
    }]);
