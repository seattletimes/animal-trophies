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

var initiativeLookup = [
  "elephant",
  "rhinoceros",
  "tiger",
  "lion",
  "leopard",
  "cheetah",
  "marine-turtle",
  "shark",
  "ray",
  "pangolin"
];

var countryLookup = require("../src/assets/countryLookup.json");

var categoryLookup = {
  "BAL": "Baleen",
  "BAR": "Bark",
  "BOC": "Bone product or carving",
  "BOD": "Whole dead animal",
  "BON": "Bone",
  "BOP": "Bone piece",
  "BUL": "Bulb, corm or tuber",
  "CAL": "Calipee, turtle cartilage",
  "CAP": "Carapace",
  "CAR": "Carving",
  "CAV": "Caviar",
  "CHP": "Timber chip",
  "CLA": "Claw, talon",
  "CLO": "Cloth",
  "COR": "Coral",
  "CPR": "Coral product",
  "CUL": "Culture of artificially propagated plants",
  "CUT": "Plant cutting",
  "DEA": "Live specimen that died during shipment",
  "DER": "Derivative",
  "DPL": "Dried plant",
  "EAR": "Ear",
  "EGG": "Egg",
  "EGL": "Live egg",
  "ESH": "Eggshell",
  "EXT": "Extract",
  "FEA": "Feather",
  "FIB": "Plant fiber",
  "FIG": "Fingerling, juvenile fish",
  "FIN": "Fin",
  "FLO": "Flower",
  "FOO": "Foot",
  "FPT": "Flower pot",
  "FRU": "Fruit",
  "GAB": "Gall bladder",
  "GAL": "Gall, bile",
  "GAR": "Garment",
  "GEN": "Genitalia",
  "GRS": "Graft rootstock",
  "HAI": "Hair",
  "HAP": "Hair product",
  "HOC": "Horn carving",
  "HOP": "Horn piece",
  "HOR": "Whole horn",
  "IJW": "Ivory jewelry",
  "IVC": "Ivory carving",
  "IVP": "Ivory piece",
  "JWL": "Jewelry",
  "KEY": "Ivory piano key",
  "LEG": "Frog leg",
  "LIV": "Live specimen",
  "LOG": "Wood log",
  "LPL": "Large leather product",
  "LPS": "Small leather product",
  "LVS": "Leaf",
  "MEA": "Meat",
  "MED": "Medicinal part or product",
  "MUS": "Musk",
  "NES": "Nest",
  "OIL": "Oil",
  "PIV": "Piano with ivory keys",
  "PLA": "Plate of fur skins",
  "PLY": "Plywood",
  "POW": "Powder",
  "ROC": "Live rock/coral",
  "ROO": "Dead root",
  "RUG": "Rug",
  "SAW": "Sawn wood",
  "SCA": "Scale",
  "SDL": "Seedling",
  "SEE": "Seed",
  "SHE": "Shell",
  "SHO": "Shoe",
  "SID": "Side, flank",
  "SKE": "Skeleton",
  "SKI": "Skin",
  "SKP": "Skin piece",
  "SKU": "Skull",
  "SOU": "Soup",
  "SPE": "Scientific or museum specimen",
  "SPR": "Shell product",
  "STE": "Plant stem",
  "SWI": "Swim bladder",
  "TAI": "Tail",
  "TEE": "Tooth",
  "TIM": "Timber",
  "TRI": "Trim",
  "TRO": "Trophy",
  "TUS": "Tusk",
  "UNS": "Unspecified",
  "VEN": "Wood veneer",
  "WAX": "Wax, ambergris",
  "WNG": "Wing",
  "WPR": "Wood product"
};

module.exports = function(grunt) {

  grunt.registerTask("data", "Load data", function() {
    grunt.task.requires("state");
    grunt.task.requires("csv");

    var specialCount = 0;
    var count = 0;
    var liveCount = 0;
    var citesData = {};

    grunt.data.csv.cites.forEach(function(row) {
      var latin = row.Genus.toLowerCase() + row.Species.toLowerCase();
      var endangered = row.CurrentListing.match(/(^|\W)I{1,2}($|\W)/);
      citesData[latin] = endangered;
    });

    var groupedData = {};

    grunt.data.csv.shipmentDetails.forEach(function(row) {

      // create new shipment group
      if (!groupedData[row.control_number]) groupedData[row.control_number] = {
        number: row.control_number.toString().slice(4),
        month: row.disp_date.split("/")[0],
        day: row.disp_date.split("/")[1],
        date: row.disp_date,
        combined: [],
        components: [] 
      };

      // add animal/category/CITES status to shipment group
      var category = row.category.toLowerCase().replace(" ", "-");
      if (category == "tro" && citesData[row.genus.toLowerCase() + row.species.toLowerCase()]) { 
        specialCount += 1
      }
      if (category == "tro") { 
        count += 1
      }
      var animal = row.generic.toLowerCase().replace(" ", "-");
      var latin = row.genus.toLowerCase() + row.species.toLowerCase();
      var protected = citesData[latin] ? "protected" : "";
      if (animal == "buffalo" && row.specific.toLowerCase() == "african") animal = "african-buffalo";
      var initiative = initiativeLookup.indexOf(animal) > -1 ? "initiative" : "";
      var combined = protected + "-" + category + "-" + animal + "-" + initiative;
      if (groupedData[row.control_number].combined.indexOf(combined) == -1) {
        groupedData[row.control_number].combined.push(combined);
      };

      // add sub-shipment to shipment group
      row.categoryName = categoryLookup[row.category];
      row.countryName = countryLookup[row.origin];
      row.protected = citesData[latin];
      row.initiative = initiative ? true : false;
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

    console.log(specialCount, count, specialCount/count)

    grunt.file.write("src/assets/groupedData.json", JSON.stringify(sorted, null, 2));
  });

};