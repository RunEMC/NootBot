// Require jsonfile
var jsonfile = require('jsonfile');

// DEBUG mode
const DEBUG = true;

// Rogue Like Adventure Game
function newPlayer(uName) {
  // Check gamesettings
  var settingsFile = 'roguedata/game_settings_rogue.json';
  var settings = new Object();
  jsonfile.readFile(settingsFile, function (err, settings) {
    if(err) console.error("Read error: " + err);
    settings["playersCount"] += 1;
    jsonfile.writeFile(settingsFile, settings, function (err) {
      if (err) console.error("Write error: " + err);
    });
  });

  //PLayerStats
  var statsFile = 'roguedata/player_stats.json';
  var stats = new Object();
  jsonfile.readFile(statsFile, function (err, stats) {
    if(err) console.error("Read error: " + err);
    stats[uName] = {
      name: uName,
      level: 1,
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

function playerInfo(uName) {

}

exports.NewPlayer = function(uName) {
  return newPlayer(uName);
}

exports.PlayerInfo = function(uName) {
  return playerInfo(uName);
}
