// Rogue Like Adventure Game
// By Ron Li

// Require jsonfile
var jsonfile = require('jsonfile');

// DEBUG mode
const DEBUG = true;


function processCommand(cmdArray, user) {
  var returnMsg;

  if (cmdArray.length) {
    if (matchCase(cmdArray[0], "explore")) { // If !rg explore
      if (cmdArray.length > 1) {
        returnMsg = explore(cmdArray[1], user);
        // console.log(cmdArray[1]);
      }
      else { // If no area chosen
        returnMsg = "------Explorable Locations (!rg explore [location])------\n" +
                    "Grassy Fields (lvl 1) - [grassyfields]";
      }
    }
  }
  else { // Handles no parameters (just !rg)
    returnMsg = "--------------------Commands--------------------\n"+
                " - !rg explore [area]: Explore an area.\n"+
                " - !rg stats [allocate]: Check your stats and allocate new stat points."
  }
  return returnMsg;
}


function explore(location, userName) {
  var returnMsg;
  var playersFile = 'roguedata/player_stats.json';
  var locations = jsonfile.readFileSync('roguedata/locations.json');
  var players = jsonfile.readFileSync(playersFile);
  var locationData = locations[location];
  var playerData = players[userName]

  // console.log(locations, location, locationData);

  if (locationData !== undefined) {
    var encounters = {
      "mobEncounters": {
        //"small_slime": 0,
      },
      "mobsDefeated": {

      },
      "itemEncounters": {
        //"apple": 0,
      }
    };

    // Prepopulate fields
    for (var i = 0; i < locationData.mobs.length; i++) {
      var mob = locationData.mobs[i];
      encounters.mobEncounters[mob] = 0;
    }
    for (var i = 0; i < locationData.items.length; i++) {
      var item = locationData.items[i];
      encounters.itemEncounters[item] = 0;
    }

    // Spawn mobs/items for each stage
    for (var i = 0; i < locationData.stages; i++) {
      spawnObj(locationData.mobs, locationData.mobSpawnChance, encounters.mobEncounters);

      if (fightMobs(encounters.mobEncounters, encounters.mobsDefeated, locationData.mobs, playerData)) {
        // Player is dead;
        returnMsg += "You Died!\n\n";
        break;
      }

      spawnObj(locationData.items, locationData.itemSpawnChance, encounters.itemEncounters);
    }

    players[userName] = playerData;
    jsonfile.writeFile(playersFile, players, function (err) {
      if (err) console.error("Write error: " + err);
    });

    // Create flavor text
    returnMsg = "While exploring " + locationData.displayName + " you defeated:\n"
    for (var i = 0; i < locationData.mobs.length; i++) {
      var mob = locationData.mobs[i]
      returnMsg += " - " + mob + ": " + encounters.mobEncounters[mob] + "\n";
    }

    returnMsg += "\nYou acquired:\n"
    for (var i = 0; i < locationData.items.length; i++) {
      var item = locationData.items[i]
      returnMsg += " - " + item + ": " + encounters.itemEncounters[item] + "\n";
    }

  }
  else {
    returnMsg = "Invalid location, use example: !rg explore grassyfields\n" +
                "------Explorable Locations (!rg explore [location])------\n" +
                "Grassy Fields (lvl 1) - [grassyfields]";
  }

  return returnMsg;
}


// Increase current encounters
function spawnObj(objs, spawnChance, currentEncounters) {
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    var randNum = Math.random();

    if (spawnChance[obj] >= randNum) {
      currentEncounters[obj] === undefined ? currentEncounters[obj] = 1 : currentEncounters[obj]++;
    }
  }
}

function fightMobs(mobEncounters, mobsDefeated, mobs, playerData) {
  var mobsData = jsonfile.readFileSync('roguedata/mobs.json');
  var returnObj; // Currently just returns if the player is dead or not
  for (var i = 0; i < mobs.length; i++) {
    var mob = mobs[i];
    var mobStats = mobsData[mob];
    var mobAmount = mobEncounters[mob];
    for (var j = 0; j < mobAmount; j++) {
      var mobHp = mobStats.hp;
      var playerHp = playerData.hpCur;
      // Fight mob till mob or player dies
      while (mobHp > 0) {
        console.log("Hp: " + playerHp + "\nMob HP: " + mobHp + "\n");
        mobHp -= playerData.atk;
        playerHp -= mobStats.atk + playerData.def;
        // Check if player is dead
        if (playerHp <= 0) {
          playerData.hpCur = 0;
          returnObj = true;
          return returnObj;
        }
      }

      // Mob is defeated
      mobsDefeated[mob] === undefined ? mobsDefeated[mob] = 1 : mobsDefeated[mob]++;
      playerData.hpCur = playerHp;
      playerData.expCur += mobStats.xpGain;
      // Add algorithms for determining xp required for next lvl and pts gain per lvl
      if (playerData.expCur >= playerData.expNext) {
        playerData.expCur -= playerData.expNext;
        playerData.skillpts++;
      }
    }
  }
  returnObj = false;
  return returnObj;
}

// Helper Functions

// Checks if two strings are equal regardless of case
function matchCase(str1, str2) {
  return str1.toUpperCase() === str2.toUpperCase();
}

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

// Function to convert strings to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// Function to add mob loot to the player's Inventory
// Returns a string of flavor text
function addLoot(uName, mob) {
  var invFile = 'roguedata/player_inventory.json';
  var inv = jsonfile.readFileSync(invFile);
  var playerInv = inv[uName];
  var dropFile = 'roguedata/mob_drops.json';
  var drops = jsonfile.readFileSync(dropFile)[mob];
  var msg = "";

  var goldGain = randomNum(drops['coinsmin'], drops['coinsmax']);
  if (goldGain) {
      msg += "You find " + goldGain + " coins.\n";
  }

  // Add items by rarity calculations below:
  var itemChance = randomNum(0, 100);

  if (itemChance <= 70) {

  }

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
  var stats = jsonfile.readFileSync(statsFile);
  var invFile = 'roguedata/player_inventory.json';
  var inv = jsonfile.readFileSync(invFile);

  // Randomly distribute 5 skill points
  var str = 1;
  var dex = 1;
  var int = 1;
  var luck = 1;
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
    atk: 1 + Math.ceil(str / 2),
    def: 0,
    str: str,
    dex: dex,
    int: int,
    luck: luck,
    skillpts: 3,
  };
  console.log(stats);
  if (stats) {
    jsonfile.writeFile(statsFile, stats, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log("writing to stats", stats);
    });
  }
  else {
    console.log("error writing stats, ", stats);
  }


  // Create new player inventory
  inv[uName] = {
    equip: {
      head: 'none',
      body: 'none',
      legs: 'none',
      feet: 'none',
      // Add more equip slots here
    },
    gold: luck + 5,
    items: {
      apples: 2
    }
  }
  console.log(inv);
  if (inv) {
    jsonfile.writeFile(invFile, inv, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log("Writing to inv, ", inv);
    });
  }
  else {
    console.log("error writing inv, ", inv);
  }
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
    msg = "Player already exists\n" +
    "Type playerInfo to see your stats.\n";

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

    // Update msg
    msg = "New character created for " + uName + "\n" +
    "Type playerInfo to see your stats.\n";

    // Make newplayer
    newPlayerSettings(uName);
  }
  return msg;
}

// Display Player info
function playerInfo(uName) {
  // Display Player Stats
  var file = 'roguedata/player_stats.json';
  var data = jsonfile.readFileSync(file);
  file = 'roguedata/player_inventory.json';
  var inv = jsonfile.readFileSync(file)[uName];

  var msg =
  "------ " + data[uName]['name'] + "'s Stats ------\n" +
  "Level: " + data[uName]['level'] + "\t\t" + "Exp: " + data[uName]['expCur'] + "/" + data[uName]['expNext'] + "\n" +
  "HP: " + data[uName]['hpCur'] + "/" + data[uName]['hpMax'] + "\t\t" + "MP: " + data[uName]['mpCur'] + "/" + data[uName]['mpMax'] + "\n" +
  "Atk: " + data[uName]['atk'] + "\t\t" + "Def: " + data[uName]['def'] + "\n" +
  "Strn: " + data[uName]['str'] + "\t\t" + "Dext: " + data[uName]['dex'] + "\n" +
  "Intl: " + data[uName]['int'] + "\t\t" + "Luck: " + data[uName]['luck'] + "\n";
  if (data[uName]['skillpts'] >= 1) {
    msg += "You have " + data[uName]['skillpts'] + " unspent stat point(s).\n";
  }
  msg +=
  "------ " + data[uName]['name'] + "'s Equipment ------\n" +
  "Head: " + inv['equip']['head'] + "\n" +
  "Body: " + inv['equip']['body'] + "\n" +
  "Legs: " + inv['equip']['legs'] + "\n" +
  "Feet: " + inv['equip']['feet'] + "\n" +
  "------ " + data[uName]['name'] + "'s Inventory ------\n" +
  "Coins: $" + inv['gold'] + "\n";
  // Loop through all the items
  var items = Object.keys(inv['items']);
  var len = items.length;
  for (var i = 0; i < len; ++i) {
    msg += toTitleCase(items[i]) + ": " + inv['items'][items[i]] + "\n";
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

  // Check for errors
  if (!location) {
    var msg = "------Explorable Locations (explore [location])------\n" +
  "Sewers (lvl 1) - [sewers]";
    return msg;
}

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
        "2. Run away\n";
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
    returnMsg += "You are not in any encounters right now (try explore [location]).\n";
  }
  else {
    var encountType = playerEncounter['type'];

    if (encountType == 'mob') {
      // Check player choice
      if (options == '1') {
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
      else if (options == 'help') {
        returnMsg += "You are currently fighting a(n) " + playerEncounter['name'].toLowerCase() + "\n" +
        "It has " + playerEncounter['hp'] + "HP remaining.\n" +
        "------Available options (encounter [number])------\n" +
        "1. Attack\n" +
        "2. Run away (like the coward you are)\n";
      }
      else {
        // Temporary:
        returnMsg += "You are currently fighting a(n) " + playerEncounter['name'].toLowerCase() + "\n" +
        "It has " + playerEncounter['hp'] + "HP remaining.\n" +
        "------Available options (encounter [number])------\n" +
        "1. Attack\n" +
        "2. Run away (like the coward you are)\n";
      }
    }
  }

  return returnMsg;
}

// Adventure
// function explore(uName, location) {
//   // Get info for the location
//   var file = 'roguedata/mobs.json';
//   var mobs = jsonfile.readFileSync(file);
//   file = 'roguedata/mob_drops.json';
//   var drops = jsonfile.readFileSync(file);
//   file = 'roguedata/encounters.json';
//   var playerEncounter = jsonfile.readFileSync(file)[uName];
//   // Potentially not needed
//   /*
//   file = 'roguedata/locations.json';
//   var locations = jsonfile.readFileSync(file);
//   var curLoc = locations[location];
//   */
//   // Flavor text
//   var returnMsg = "";
//
//   // Check if player is not already in an encounter
//   if (!playerEncounter || playerEncounter['type'] == 'none') {
//     // Create a new encounter
//     returnMsg += encounterNew(uName, location)
//   }
//   // Player is already in an encounter
//   else {
//     returnMsg +=
//     "Your path is blocked by the " + playerEncounter['name'] + "\n" +
//     "------Available options (encounter [number])------\n" +
//     "1. Attack\n" +
//     "2. Run away (like the coward you are)\n";
//   }
//
//   // 1. Spawn a mob
//
//
//
//   return returnMsg;//encounter(uName, location);
// }


// Exports
exports.NewPlayer = function(uName) {
  return newPlayer(uName);
}
exports.PlayerInfo = function(uName) {
  return playerInfo(uName);
}
// exports.Explore = function(uName, location) {
//   return explore(uName, location);
// }
exports.Encounter = function(uName, options) {
  return encounter(uName, options);
}

exports.processCommand = function(cmdArray, user) {
  return processCommand(cmdArray, user);
}
