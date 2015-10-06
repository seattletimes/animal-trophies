// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("angular");

var app = angular.module("animal-shipments", []);

app.controller("animalController", ["$scope", function($scope) {
  $scope.shipments = arrayedData;
}]);