// Rogue Like Adventure Game
// By Ron Li

// Require jsonfile
var jsonfile = require('jsonfile');

// DEBUG mode
const DEBUG = true;

//Get random integer, inclusive
function randomNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random real number, >= min, < max
function randomRealNum(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//Check if elelment exists in array
function isExist(element, arr) {
  var len = arr.length;
  for (var i = 0; i < len; ++i) {
    if (arr[i] === element) {
      return true;
    }
  }
  return false;
}

// Default starting values for each player
function newPlayerSettings(uName) {
  //PLayerStats
  var statsFile = 'roguedata/player_stats.json';
  var stats = new Object();
  jsonfile.readFile(statsFile, function (err, stats) {
    if (err) console.error("Read error: " + err);

    // Randomly distribute 5 skill points
    var str = 0;
    var dex = 0;
    var int = 0;
    var luck = 0;
    for (var i = 0; i < 5; ++i) {
      switch (randomNum(1, 4)) {
        case 1:
          str++;
          break;
        case 2:
          dex++;
          break;
        case 3:
          int++;
          break;
        case 4:
          luck++;
          break;
        default:
          str++;
        }
    }
    // Create new player stats
    stats[uName] = {
      name: uName,
      level: 1,
      expCur: 0,
      expNext: 10,
      hpCur: 5,
      hpMax: 5,
      mpMax: 2,
      mpCur: 2,
      atk: 5,
      def: 5,
      str: str,
      dex: dex,
      int: int,
      luck: luck,
      skillpts: 3,
    };
    jsonfile.writeFile(statsFile, stats, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log(stats);
    });
  });
}

// Making a New Player
function newPlayer(uName) {
  // Check gamesettings
  var settingsFile = 'roguedata/game_settings_rogue.json';
  var settings = jsonfile.readFileSync(settingsFile);
  var msg;
  // More info for debugging
  if (DEBUG) console.log(settings);

  // Check if player exists
  if (isExist(uName, settings['players'])) {
    console.log("Player exists.")
    msg = "Player already exists\n";

    // Make newplayer anyways if in debug
    if (DEBUG) newPlayerSettings(uName);
  }
  else {
    // Update Player Count and players list
    settings["playersCount"] += 1;
    settings["players"].push(uName);
    jsonfile.writeFile(settingsFile, settings, function (err) {
      if (err) console.error("Write error: " + err);
    });

    // Make newplayer
    newPlayerSettings(uName);

    // Update msg
    msg = "New character created for " + uName + "\n";
  }

  // Display Player Info
  //msg += playerInfo(uName);
  return msg;
}

// Display Player info
function playerInfo(uName) {
  // Display Player Stats
  var file = 'roguedata/player_stats.json';
  var data = jsonfile.readFileSync(file);

  var msg =
  "------ " + data[uName]['name'] + "'s Stats ------\n" +
  "Level: " + data[uName]['level'] + "\t\t" + "Exp: " + data[uName]['expCur'] + "/" + data[uName]['expNext'] + "\n" +
  "HP: " + data[uName]['hpCur'] + "/" + data[uName]['hpMax'] + "\t\t" + "MP: " + data[uName]['mpCur'] + "/" + data[uName]['mpMax'] + "\n" +
  "Atk: " + data[uName]['atk'] + "\t\t" + "Def: " + data[uName]['def'] + "\n" +
  "Strn: " + data[uName]['str'] + "\t\t" + "Dext: " + data[uName]['dex'] + "\n" +
  "Intl: " + data[uName]['int'] + "\t\t" + "Luck: " + data[uName]['luck'] + "\n";
  if (data[uName]['skillpts'] >= 1) {
    msg += "You have " + data[uName]['skillpts'] + " unspent stat point(s).";
  }
  return msg;
}

function encounterNew(uName, location) {
  // Get info for the location
  var file = 'roguedata/mobs.json';
  var mobs = jsonfile.readFileSync(file);
  file = 'roguedata/mob_drops.json';
  var drops = jsonfile.readFileSync(file);
  file = 'roguedata/locations.json';
  var locations = jsonfile.readFileSync(file);
  location = locations[location];
  // Flavor text
  var returnMsg = "";

  // Switch case to determine encounter
  // 1. Spawn mob
  // 2. Treasure
  // 3. Trap
  // 4. Special
  // 5. Nothing
  var alreadyEncountered = false;
  var encounterChance = location['encounterChance'];
  var encounter = randomNum(1, 100);
  if (encounter <= encounterChance['mob']) {
    // Spawn mob
    var len = location['mobs'].length;
    var prevChance = 0;
    for (var i = 0; i < len; ++i) {
      var mob = location['mobs'][i];
      var spawnChance = location['spawnChance'][mob];
      var mobHp = mobs[mob]['hp'];
      if (Math.random() <= spawnChance + prevChance) {
        var encounter = new Object();
        encounter[uName] = {
          type: 'mob',
          name: mob,
          hp: mobHp
          //options: []
        }

        file = 'roguedata/encounters.json';
        jsonfile.writeFile(file, encounter, function (err) {
          if (err) console.error("Write error: " + err);
        });

        returnMsg +=
        "A " + mob + " appears!\n" +
        "------Available options (encounter [number])------\n" +
        "1. Attack\n" +
        "2. Run away (like the coward you are)\n";
        break;
      }
      prevChance += spawnChance;
    }
    alreadyEncountered = true;
  }
  encounter -= encounterChance['mob'];
  if (encounter <= encounterChance['trap'] && !alreadyEncountered) {
    // Trap
    alreadyEncountered = true;
    returnMsg += "It's a trap!\n";
  }
  encounter -= encounterChance['trap'];
  if (encounter < encounterChance['nothing'] && !alreadyEncountered) {
    // Nothing
    alreadyEncountered = true;
    returnMsg += "You find nothing of interest in the place.\n";
  }
  encounter -= encounterChance['nothing'];
  if (encounter <= encounterChance['treasure'] && !alreadyEncountered) {
    // Treasure
    alreadyEncountered = true;
    returnMsg += "You find a treasure chest!\n";
  }
  encounter -= encounterChance['treasure'];
  if (encounter <= encounterChance['special'] && !alreadyEncountered) {
    // Special
    alreadyEncountered = true;
    returnMsg += "ERROR. YOU ARE NULL AND VOID.\n";
  }

  return returnMsg;
}

// Refactor available encounters in explore()
function encounter(uName, options) {
  // Get info for the location
  var file = 'roguedata/mobs.json';
  var mobs = jsonfile.readFileSync(file);
  file = 'roguedata/mob_drops.json';
  var drops = jsonfile.readFileSync(file);
  file = 'roguedata/locations.json';
  var locations = jsonfile.readFileSync(file);
  file = 'roguedata/encounters.json';
  var encounterList = jsonfile.readFileSync(file);
  var playerEncounter = encounterList[uName];
  file = 'roguedata/player_stats.json';
  var playerStatsList = jsonfile.readFileSync(file);
  var playerStats = playerStatsList[uName];
  // Flavor text
  var returnMsg = "";

  // Create a new encounter if one does not exist
  if (!playerEncounter || playerEncounter['type'] == 'none') {
    //returnMsg = encounterNew(uName, locations[options[0]]);
    returnMsg += "You are not in any encounters right now.\n";
  }
  else {
    var encountType = playerEncounter['type'];

    if (encountType == 'mob') {
      // Check player choice
      if (options[0] == '1') {
        var mobStats = mobs[playerEncounter['name']];
        var mobDmg = randomNum(mobStats['atkmin'], mobStats['atkmax']);
        // Add player defense calculations here:

        var playerDmg = playerStats['atk'];
        // Add player damage calculations here:

        // Mob hp left
        var mobHpLeft = Math.max(playerEncounter['hp'] - playerDmg, 0);
        playerEncounter['hp'] = mobHpLeft;
        encounterList[uName] = playerEncounter;

        // Flavor text
        returnMsg +=
        "You attack the " + playerEncounter['name'].toLowerCase() + " for " + playerDmg + " damage.\n" +
        "It has " + mobHpLeft + " HP remaining.\n";

        // If mob is still alive
        if (mobHpLeft) {
          // Attack back
          var playerHp = Math.max(0, playerStats['hpCur'] - mobDmg);
          playerStats['hpCur'] = playerHp;
          playerStatsList[uName] = playerStats;
          // Update flavor text
          returnMsg += "The angry " + playerEncounter['name'].toLowerCase() + " attacks you for " + mobDmg + " damage.\n" +
          "Your HP: " + playerStats['hpCur'] + "/" + playerStats['hpMax'] + "\n" +
          "------Available options (encounter [number])------\n" +
          "1. Attack\n" +
          "2. Run away (like the coward you are)\n";

          file = 'roguedata/encounters.json';
          jsonfile.writeFile(file, encounterList, function (err) {
            if (err) console.error("Write error: " + err);
          });
          file = 'roguedata/player_stats.json';
          jsonfile.writeFile(file, playerStatsList, function (err) {
            if (err) console.error("Write error: " + err);
          });
        }
        // The mob is dead
        else {
          returnMsg += "You have vanquished the " + playerEncounter['name'].toLowerCase() + "\n" +
          "You have earned " + mobStats['xpGain'] + " xp towards your next level.\n";
          playerStats['expCur'] += mobStats['xpGain'];

          // Increase player level if possible
          if (playerStats['expCur'] >= playerStats['expNext']) {
            playerStats['expCur'] -= playerStats['expNext'];
            playerStats['level']++;
            playerStats['skillpts'] += 3;
            returnMsg += "You have leveled up to lvl" + playerStats['level'] + "!\n";
          }
          // Update player stats file
          playerStatsList[uName] = playerStats;
          file = 'roguedata/player_stats.json';
          jsonfile.writeFile(file, playerStatsList, function (err) {
            if (err) console.error("Write error: " + err);
          });

          // Update encounters file
          playerEncounter['type'] = 'none';
          encounterList[uName] = playerEncounter;
          file = 'roguedata/encounters.json';
          jsonfile.writeFile(file, encounterList, function (err) {
            if (err) console.error("Write error: " + err);
          });
        }
      }
      else {
        returnMsg += "You are currently fighting a(n) " + playerEncounter['name'].toLowerCase() + "\n" +
        "HP: " + playerEncounter['hp'] + "\n";
      }
    }
  }

  return returnMsg;
}

// Adventure
function explore(uName, location) {
  // Get info for the location
  var file = 'roguedata/mobs.json';
  var mobs = jsonfile.readFileSync(file);
  file = 'roguedata/mob_drops.json';
  var drops = jsonfile.readFileSync(file);
  file = 'roguedata/encounters.json';
  var playerEncounter = jsonfile.readFileSync(file)[uName];
  // Potentially not needed
  /*
  file = 'roguedata/locations.json';
  var locations = jsonfile.readFileSync(file);
  var curLoc = locations[location];
  */
  // Flavor text
  var returnMsg = "";

  // Check if player is not already in an encounter
  if (!playerEncounter || playerEncounter['type'] == 'none') {
    // Create a new encounter
    returnMsg += encounterNew(uName, location[0])
  }
  // Player is already in an encounter
  else {
    returnMsg +=
    "Your path is blocked by the " + playerEncounter['name'] + "\n" +
    "------Available options (encounter [number])------\n" +
    "1. Attack\n" +
    "2. Run away (like the coward you are)\n";
  }

  // 1. Spawn a mob



  return returnMsg;//encounter(uName, location);
}


// Exports
exports.NewPlayer = function(uName) {
  return newPlayer(uName);
}
exports.PlayerInfo = function(uName) {
  return playerInfo(uName);
}
exports.Explore = function(uName, location) {
  return explore(uName, location);
}
exports.Encounter = function(uName, options) {
  return encounter(uName, options);
}
