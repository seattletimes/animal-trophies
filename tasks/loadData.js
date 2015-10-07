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

var categoryLookup = {
  "BAL": "baleen",
  "BAR": "bark",
  "BOC": "bone product or carving",
  "BOD": "whole dead animal",
  "BON": "bones",
  "BOP": "bone pieces",
  "BUL": "bulbs, corms or tubers",
  "CAL": "calipees, turtle cartilage",
  "CAP": "carapaces",
  "CAR": "carvings",
  "CAV": "caviar",
  "CHP": "timber chips",
  "CLA": "claws, talons",
  "CLO": "cloth",
  "COR": "coral",
  "CPR": "coral products",
  "CUL": "cultures of artificially propagated plants",
  "CUT": "plant cuttings",
  "DEA": "live specimen that died during shipment",
  "DER": "derivative",
  "DPL": "dried plants",
  "EAR": "ear",
  "EGG": "egg",
  "EGL": "live eggs",
  "ESH": "eggshell",
  "EXT": "extracts",
  "FEA": "feathers",
  "FIB": "plant fiber",
  "FIG": "fingerlings, juvenile fish",
  "FIN": "fin",
  "FLO": "flowers",
  "FOO": "foot",
  "FPT": "flower pot",
  "FRU": "fruit",
  "GAB": "gall bladders",
  "GAL": "gall, bile",
  "GAR": "garment",
  "GEN": "genitalia",
  "GRS": "graft rootstocks",
  "HAI": "hair",
  "HAP": "hair product",
  "HOC": "horn carving",
  "HOP": "horn pieces",
  "HOR": "whole horn",
  "IJW": "ivory jewelry",
  "IVC": "ivory carvings",
  "IVP": "ivory pieces",
  "JWL": "jewelry",
  "KEY": "ivory piano key",
  "LEG": "frog legs",
  "LIV": "live specimens",
  "LOG": "wood logs",
  "LPL": "large leather product",
  "LPS": "small leather product",
  "LVS": "leaves",
  "MEA": "meat",
  "MED": "medicinal part or product",
  "MUS": "musk",
  "NES": "nest",
  "OIL": "oil",
  "PIV": "piano with ivory keys",
  "PLA": "plates of fur skins",
  "PLY": "plywood",
  "POW": "powder",
  "ROC": "live rock, live coral",
  "ROO": "dead root",
  "RUG": "rugs",
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
  "STE": "plant stems",
  "SWI": "swim bladder",
  "TAI": "tails",
  "TEE": "teeth",
  "TIM": "timber",
  "TRI": "trim",
  "TRO": "trophy",
  "TUS": "tusks",
  "UNS": "unspecified",
  "VEN": "wood veneer",
  "WAX": "wax, ambergris",
  "WNG": "wing",
  "WPR": "wood product"
}

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
      row.categoryName = categoryLookup[row.category];
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