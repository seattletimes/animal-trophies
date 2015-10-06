var monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

module.exports = function(grunt) {

  grunt.registerTask("data", "Load data", function() {
    grunt.task.requires("state");
    grunt.task.requires("csv");

    var groupedData = {};

    grunt.data.csv.animalData.forEach(function(row) {

      // create new shipment group
      if (!groupedData[row["control_number"]]) groupedData[row["control_number"]] = {
          month: row["ship_date"].split("-")[1],
          category: row.category,
          components: [] 
        };

      // add sub-shipment to shipment group
      groupedData[row["control_number"]].components.push(row);
    });

    var byMonth = {};

    for (var group in groupedData) {
      var month = Number(groupedData[group].month);

      // create new month group
      if (!byMonth[month]) { 
        byMonth[month] = {
          monthName: monthNames[month]
          shipments: [] 
        };
      }
      // add shipment to month group
      byMonth[month].shipments.push(groupedData[group]);  
    }

    var keys = Object.keys(byMonth).map(Number);

      keys.sort();
      var sorted = {};
      keys.forEach(function(key) {
        sorted[key] = byMonth[key];
      });

    grunt.file.write("src/assets/groupedData.json", JSON.stringify(sorted));
  });

};