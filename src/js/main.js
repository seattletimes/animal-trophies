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
        var flippedHoriz = bounds.left > window.innerWidth / 2;
        var tooltip  = el.querySelector(".tooltip");
        if (flippedHoriz) {
          tooltip.classList.add("flipped-horiz");
        } else {
          tooltip.classList.remove("flipped-horiz");
        }
        var flippedVert = bounds.top > window.innerHeight / 2;
        var tooltip  = el.querySelector(".tooltip");
        if (flippedVert) {
          tooltip.classList.add("flipped-vert");
        } else {
          tooltip.classList.remove("flipped-vert");
        }
      })
    }
  }
});
