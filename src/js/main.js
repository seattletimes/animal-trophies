// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("angular");

var app = angular.module("animal-shipments", []);

app.controller("animalController", ["$scope", "$http", function($scope, $http) {
  $http({
    method: 'GET',
    url: './assets/groupedData.json'
  }).then(function successCallback(response) {
    $scope.monthGroups = response.data;
  });

  $scope.filter = "trophies";
}]);