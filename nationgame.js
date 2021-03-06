// Require jsonfile
var jsonfile = require('jsonfile');

// DEBUG mode
const DEBUG = true;


// Kingdom Building Game
function newNation(uName) {
  // Check gamesettings
  var settingsFile = 'playerdata/game_settings_kingdom.json';
  var settings = new Object();
  jsonfile.readFile(settingsFile, function (err, settings) {
    if(err) console.error("Read error: " + err);
    settings["playersCount"] += 1;
    jsonfile.writeFile(settingsFile, settings, function (err) {
      if (err) console.error("Write error: " + err);
    });
  });

  //Message Author:
  //var uName = message.author.username;

  //Resources
  var resourceFile = 'playerdata/user_resources.json';
  var resources = new Object();
  jsonfile.readFile(resourceFile, function (err, resources) {
    if(err) console.error("Read error: " + err);
    resources[uName] = {
      name: uName,
      manpower: 200,
      lumber: 100,
      stone: 100,
      iron: 0,
      coins: 500,
    };
    jsonfile.writeFile(resourceFile, resources, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log(resources);
    });
  });

  //Army Composition
  var armyFile = 'playerdata/user_army.json';
  var army = new Object();
  jsonfile.readFile(armyFile, function (err, army) {
    if(err) console.error("Read error: " + err);
    army[uName] = {
      swordsmen: {
        have: 100,
        max: 100,
      },
      spearmen: {
        have: 0,
        max: 0,
      },
      archers: {
        have: 0,
        max: 0,
      },
      crossbowmen: {
        have: 0,
        max: 0,
      },
      light_cavalry: {
        have: 0,
        max: 0,
      },
      heavy_cavalry: {
        have: 0,
        max: 0,
      },
    };
    jsonfile.writeFile(armyFile, army, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log(army);
    });
  });

  //Infrastructure
  var buildingsFile = 'playerdata/user_buildings.json';
  var buildings = new Object();
  jsonfile.readFile(buildingsFile, function (err, buildings) {
    if(err) console.error("Read error: " + err);
    buildings[uName] = {
      land: {
        level: 1,
        base_cost: {
          coins: 500,
        },
      },
      housing: {
        level: 1,
        base_cost: {
          lumber: 100,
          stone: 100,
        },
      },
      lumber_yard: {
        level: 0,
        base_cost: {
          lumber: 300,
          stone: 50,
        },
      },
      quarry: {
        level: 0,
        base_cost: {
          lumber: 50,
          stone: 200,
        },
      },
      mine: {
        level: 0,
        base_cost: {
          lumber: 100,
          stone: 500,
        },
      },
      market: {
        level: 0,
        base_cost: {
          lumber: 800,
          stone: 450,
        },
      },
      infantry_barracks: {
        level: 0,
        base_cost: {
          lumber: 150,
          stone: 150,
          coins: 100,
        },
      },
      archery_range: {
        level: 0,
        base_cost: {
          lumber: 250,
          stone: 150,
          coins: 100,
        },
      },
      stables: {
        level: 0,
        base_cost: {
          lumber: 150,
          stone: 250,
          coins: 300,
        },
      },
    };
    jsonfile.writeFile(buildingsFile, buildings, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log(buildings);
    });
  });

  return nationInfo(uName);
}

function nationInfo(uName) {
  var file = 'playerdata/user_resources.json';
  // Author Username
  //var uName = message.author.username;

  // Display Resources
  var data = jsonfile.readFileSync(file);
  console.log(uName);
  var msg = data[uName]['name'] + "'s Kingdom\n"
  + "----------Resources (decisions)----------\n"
  + "Manpower:guardsman:: " + data[uName]['manpower'] + "\n"
  + "Lumber:evergreen_tree:: " + data[uName]['lumber'] + "\n"
  + "Stone:full_moon:: " + data[uName]['stone'] + "\n"
  + "Iron:white_medium_square:: " + data[uName]['iron'] + "\n"
  + "Coins: " + data[uName]['coins'] + "\n";

  // Display Army Comp
  file = 'playerdata/user_army.json'
  data = jsonfile.readFileSync(file);
  msg += "----------Army Composition (recruit [unit])----------\n"
  + "Swordsmen: " + data[uName]['swordsmen']['have'] + "/" + data[uName]['swordsmen']['max'] + "\n"
  + "Spearmen: " + data[uName]['spearmen']['have'] + "/" + data[uName]['spearmen']['max'] + "\n"
  + "Archers: " + data[uName]['archers']['have'] + "/" + data[uName]['archers']['max'] + "\n"
  + "Crossbowmen: " + data[uName]['crossbowmen']['have'] + "/" + data[uName]['crossbowmen']['max'] + "\n"
  + "Light Cavalry: " + data[uName]['light_cavalry']['have'] + "/" + data[uName]['light_cavalry']['max'] + "\n"
  + "Heavy Cavalry: " + data[uName]['heavy_cavalry']['have'] + "/" + data[uName]['heavy_cavalry']['max'] + "\n";

  // Display Infrastructure
  file = 'playerdata/user_buildings.json'
  data = jsonfile.readFileSync(file);
  msg += "----------Infrastructure Level (upgrade [infrastructure])----------\n"
  + "Land: " + data[uName]['land']['level'] + "\n"
  + "Lumber Yard: " + data[uName]['lumber_yard']['level'] + "\n"
  + "Quarry: " + data[uName]['quarry']['level'] + "\n"
  + "Mine: " + data[uName]['mine']['level'] + "\n"
  + "Market: " + data[uName]['market']['level'] + "\n"
  + "Infantry Barracks: " + data[uName]['infantry_barracks']['level'] + "\n"
  + "Archery Range: " + data[uName]['archery_range']['level'] + "\n"
  + "Stables: " + data[uName]['stables']['level'] + "\n";

  return msg;
}

exports.NewNation = function(uName) {
  return newNation(uName);
}

exports.NationInfo = function(uName) {
  return nationInfo(uName);
}
