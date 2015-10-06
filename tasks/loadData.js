module.exports = function(grunt) {

  grunt.registerTask("data", "Load data", function() {
    grunt.task.requires("state");
    grunt.task.requires("csv");

    var groupedData = {};
    grunt.data.csv.animalData.forEach(function(row) {
      if (!groupedData[row["control_number"]]) groupedData[row["control_number"]] = {
          month: row["ship_date"].split("-")[1],
          day: row["ship_date"].split("-")[2],
          components: [] 
        };
      groupedData[row["control_number"]].components.push(row);
    });
    var byMonth = {};
    for (var group in groupedData) {
      if (!byMonth[groupedData[group].month]) byMonth[groupedData[group].month] = {
          month: groupedData[group].month,
          shipments: [] 
        };
      byMonth[groupedData[group].month].shipments.push(groupedData[group]);
    }
    grunt.file.write("src/assets/groupedData.json", JSON.stringify(byMonth));
  });

};