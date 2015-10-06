var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask("data", "Load data", function() {
    var file = grunt.file.expand("data/animal_data.csv");

        grunt.task.requires("state");
        
    grunt.data.json = {};
    var json = grunt.file.readJSON(file);
    grunt.data.json.animalData = json;
  });

};