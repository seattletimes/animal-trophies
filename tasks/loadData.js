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
        day: row["ship_date"].split("-")[2],
        animals: [],
        categories: [],
        components: [] 
      };

      // add category to shipment group
      var category = row.category.toLowerCase().replace(" ", "-");
      if (groupedData[row["control_number"]].categories.indexOf(category) == -1) {
        groupedData[row["control_number"]].categories.push(category);
      };

      // add animal to shipment group
      var animal = row["generic_name"].toLowerCase().replace(" ", "-");
      if (groupedData[row["control_number"]].animals.indexOf(animal) == -1) {
        groupedData[row["control_number"]].animals.push(animal);
      };

      // add sub-shipment to shipment group
      row["specific_name"] = row["specific_name"].capitalize();
      row["generic_name"] = row["generic_name"].capitalize();
      groupedData[row["control_number"]].components.push(row);

    });

    var byMonth = {};

    for (var group in groupedData) {
      groupedData[group].animals = groupedData[group].animals.join(" ");
      groupedData[group].categories = groupedData[group].categories.join(" ");

      var month = Number(groupedData[group].month);

      // create new month group
      if (!byMonth[month]) { 
        byMonth[month] = {
          monthName: monthNames[month],
          shipments: [] 
        };
      }
      // add shipment to month group
      byMonth[month].shipments.push(groupedData[group]);  
    }

    for (var month in byMonth) {
      byMonth[month].shipments.sort(function(a,b) {
        return a.day - b.day;
      });
    }

    // sort months
    var keys = Object.keys(byMonth).map(Number);
    keys.sort();
    var sorted = {};
    keys.forEach(function(key) {
      sorted[key] = byMonth[key];
    });

    grunt.file.write("src/assets/groupedData.json", JSON.stringify(sorted));
  });

};