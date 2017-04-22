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
    if(err) console.error("Read error: " + err);
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
  msg += playerInfo(uName);
  return msg;
}

function playerInfo(uName) {
  var file = 'roguedata/player_stats.json';

  // Display Player Stats
  var data = jsonfile.readFileSync(file);
  if (DEBUG) console.log(uName);
  var msg =
  "------ " + data[uName]['name'] + "'s Stats ------\n" +
  "Level: " + data[uName]['level'] + "\t\t" + "Exp: " + data[uName]['expCur'] + "/" + data[uName]['expNext'] + "\n" +
  "HP: " + data[uName]['hpCur'] + "/" + data[uName]['hpMax'] + "\t\t" + "MP: " + data[uName]['mpCur'] + "/" + data[uName]['mpMax'] + "\n" +
  "Atk: " + data[uName]['atk'] + "\t\t" + "Def: " + data[uName]['def'];

  return msg;
}

exports.NewPlayer = function(uName) {
  return newPlayer(uName);
}

exports.PlayerInfo = function(uName) {
  return playerInfo(uName);
}
