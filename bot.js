const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require('./token.js');
const Game = require('./game.js');

//Debug mode?
const DEBUG = true;

//Get random integer, inclusive
function randomNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Bad implementation of a sleep function
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

bot.on('ready', () => {
  console.log("I am ready!");
});

bot.on('message', message => {
  if (message.content === 'ping') {
    if (DEBUG) {
      message.channel.sendMessage('pong');
      message.reply(message.author.avatarURL);

      const vChan = message.member.voiceChannel;
      vChan.join().then(connection => {
        connection.playFile('audio/rickroll.mp3');
        return console.log('Connected!').catch(console.error);
      });
    }
  }
  else if (message.content === 'rickrollme') {
    const vChan = message.member.voiceChannel;

    vChan.join().then(connection => {
      const dispatcher = connection.playFile('audio/rickroll.mp3');
      dispatcher.on('end', () => {
        if (DEBUG) console.log("Song ended.");
        vChan.leave();
      });
      return console.log('Connected!').catch(console.error);
    });
  }
  else if (message.content === 'leave') {
    const vChan = message.member.voiceChannel;
    vChan.leave();
  }
  else if (message.content === 'newNation') {
    var nationinfo = Game.NewNation(message.author.username);
    message.channel.sendMessage(nationinfo);
    /*
    // Require jsonfile
    var jsonfile = require('jsonfile');
    // Check gamesettings
    var settingsFile = 'playerdata/game_settings.json';
    var settings = new Object();
    jsonfile.readFile(settingsFile, function (err, settings) {
      if(err) console.error("Read error: " + err);
      settings["playersCount"] += 1;
      jsonfile.writeFile(settingsFile, settings, function (err) {
        if (err) console.error("Write error: " + err);
      });
    });

    //Message Author:
    var uName = message.author.username;

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
*/
  }
  else if (message.content === 'nationInfo') {

    var nationinfo = Game.NationInfo(message.author.username);
    message.channel.sendMessage(nationinfo);
    /*
    // Requires
    var jsonfile = require('jsonfile');
    var file = 'playerdata/user_resources.json';
    // Author Username
    var uName = message.author.username;

    // Display Resources
    var data = jsonfile.readFileSync(file);
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

    // Send Message
    message.channel.sendMessage(msg);
    */
  }
  else if (message.content.startsWith('upgrade')) {
    // Get the infrastructure to upgrade
    var building = message.content.split(" ");
    building.splice(0, 1);

    // Get the available buildings
    var buildingsFile = 'playerdata/user_buildings.json';
    var buildings = jsonfile.readFileSync(buildingsFile);

    // Get the player's resources
    var resourcesFile = 'playerdata/user_resources.json';
    var resources = jsonfile.readFileSync(buildingsFile);

    // Compare and build if player has the resources
    //if ()

  }

  /* Template For Player Actions
  else if (message.content === 'recoverManpower') {
    var jsonfile = require('jsonfile');
    var file = 'playerdata/user_resources.json';
    jsonfile.readFile(file, function (err, obj) {
      // Increment manpower
      var gain = randomNum(100, 5000);
      obj["manpower"] += gain;
      message.channel.sendMessage("Recovered " + gain + " men.");

      // Write new data to json
      jsonfile.writeFile(file, obj, function (err) {
        if (err) console.error(err);
      });
    });
  }
  */
});

bot.login(token.gimmietoken());
