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

app.directive("flipTip", function() {
  return {
    restrict: "A",
    link: function(scope, element) {
      var el = element[0];
      element.on("mouseenter click", function() {
        var bounds = el.getBoundingClientRect();
        var flipped = bounds.left > window.innerWidth / 2;
        var tooltip  = el.querySelector(".tooltip");
        if (flipped) {
          tooltip.classList.add("flipped");
        } else {
          tooltip.classList.remove("flipped");
        }
      })
    }
  }
});
