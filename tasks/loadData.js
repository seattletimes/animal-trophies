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
];

var countryLookup = require("../src/assets/countryLookup.json");

var categoryLookup = {
  "BAL": "baleen",
  "BAR": "bark",
  "BOC": "bone product or carving",
  "BOD": "whole dead animal",
  "BON": "bone",
  "BOP": "bone piece",
  "BUL": "bulb, corm or tuber",
  "CAL": "calipee, turtle cartilage",
  "CAP": "carapace",
  "CAR": "carving",
  "CAV": "caviar",
  "CHP": "timber chip",
  "CLA": "claw, talon",
  "CLO": "cloth",
  "COR": "coral",
  "CPR": "coral product",
  "CUL": "culture of artificially propagated plants",
  "CUT": "plant cutting",
  "DEA": "live specimen that died during shipment",
  "DER": "derivative",
  "DPL": "dried plant",
  "EAR": "ear",
  "EGG": "egg",
  "EGL": "live egg",
  "ESH": "eggshell",
  "EXT": "extract",
  "FEA": "feather",
  "FIB": "plant fiber",
  "FIG": "fingerling, juvenile fish",
  "FIN": "fin",
  "FLO": "flower",
  "FOO": "foot",
  "FPT": "flower pot",
  "FRU": "fruit",
  "GAB": "gall bladder",
  "GAL": "gall, bile",
  "GAR": "garment",
  "GEN": "genitalia",
  "GRS": "graft rootstock",
  "HAI": "hair",
  "HAP": "hair product",
  "HOC": "horn carving",
  "HOP": "horn piece",
  "HOR": "whole horn",
  "IJW": "ivory jewelry",
  "IVC": "ivory carving",
  "IVP": "ivory piece",
  "JWL": "jewelry",
  "KEY": "ivory piano key",
  "LEG": "frog leg",
  "LIV": "live specimen",
  "LOG": "wood log",
  "LPL": "large leather product",
  "LPS": "small leather product",
  "LVS": "leaf",
  "MEA": "meat",
  "MED": "medicinal part or product",
  "MUS": "musk",
  "NES": "nest",
  "OIL": "oil",
  "PIV": "piano with ivory keys",
  "PLA": "plate of fur skins",
  "PLY": "plywood",
  "POW": "powder",
  "ROC": "live rock/coral",
  "ROO": "dead root",
  "RUG": "rug",
  "SAW": "sawn wood",
  "SCA": "scale",
  "SDL": "seedling",
  "SEE": "seed",
  "SHE": "shell",
  "SHO": "shoe",
  "SID": "side, flank",
  "SKE": "skeleton",
  "SKI": "skin",
  "SKP": "skin piece",
  "SKU": "skull",
  "SOU": "soup",
  "SPE": "scientific or museum specimen",
  "SPR": "shell product",
  "STE": "plant stem",
  "SWI": "swim bladder",
  "TAI": "tail",
  "TEE": "tooth",
  "TIM": "timber",
  "TRI": "trim",
  "TRO": "trophy",
  "TUS": "tusk",
  "UNS": "unspecified",
  "VEN": "wood veneer",
  "WAX": "wax, ambergris",
  "WNG": "wing",
  "WPR": "wood product"
};

module.exports = function(grunt) {

  grunt.registerTask("data", "Load data", function() {
    grunt.task.requires("state");
    grunt.task.requires("csv");

    var citesData = {};

    grunt.data.csv.cites.forEach(function(row) {
      var latin = row.Genus.toLowerCase() + row.Species.toLowerCase();
      var endangered = (row.CurrentListing !== "III" && row.CurrentListing !== "NC");
      citesData[latin] = endangered;
    });

    var groupedData = {};

    grunt.data.csv.shipmentDetails.forEach(function(row) {

      // create new shipment group
      if (!groupedData[row["control_number"]]) groupedData[row["control_number"]] = {
        month: row.disp_date.split("/")[0],
        day: row.disp_date.split("/")[1],
        date: row.disp_date,
        combined: [],
        components: [] 
      };

      // add animal/category to shipment group
      var category = row.category.toLowerCase().replace(" ", "-");
      var animal = row.generic.toLowerCase().replace(" ", "-");
      if (animal == "buffalo" && row.specific.toLowerCase() == "african") animal = "african-buffalo";
      var combined = category + "-" + animal;
      if (groupedData[row.control_number].combined.indexOf(combined) == -1) {
        groupedData[row.control_number].combined.push(combined);
      };

      // add CITES status
      var latin = row.genus.toLowerCase() + row.species.toLowerCase();
      if (citesData[latin]) {
        console.log(latin)
        groupedData[row.control_number].combined.push("endangered");
      }

      // add sub-shipment to shipment group
      row.categoryName = categoryLookup[row.category];
      row.countryName = countryLookup[row.origin];
      row.unit = row.unit.toLowerCase();
      delete row.species;
      delete row.genus;

      var repeated = false;
      groupedData[row.control_number].components.forEach(function(component) {
        if (
          component.category == row.category &&
          component.country == row.country &&
          component.generic == row.generic &&
          component.specific == row.specific &&
          component.unit == row.unit
        ) {
          repeated = true;
          component.qty += row.qty;
        }
      });
      if (!repeated) {
        groupedData[row.control_number].components.push(row);
      }
    });

    var byMonth = {};

    for (var group in groupedData) {

      groupedData[group].combined = groupedData[group].combined.join(" ");

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

    grunt.file.write("src/assets/groupedData.json", JSON.stringify(sorted, null, 2));
  });

};