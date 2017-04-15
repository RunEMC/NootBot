const Discord = require('discord.js');
const bot = new Discord.Client();
const token = "MTc3MTc3ODgwNjkyOTE2MjI1.CgqxkA.tN-6-EssqGux38sScsLXY4up2uo";

//Debug mode?
const DEBUG = true;

//Get random integer, inclusive
function randomNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

bot.on('ready', () => {
  console.log("I am ready!");
});

bot.on('message', message => {
  if (message.content === 'ping') {
    message.channel.sendMessage('pong');
    message.reply(message.author.avatarURL);

    const vChan = message.member.voiceChannel;
    vChan.join().then(connection => {
      connection.playFile('audio/rickroll.mp3');
      return console.log('Connected!').catch(console.error);
    });
  }
  else if (message.content === 'fuckoffbloodywanker') {
    const vChan = message.member.voiceChannel;
    vChan.leave();
  }
  else if (message.content === 'newPlayer') {
    // Require jsonfile
    var jsonfile = require('jsonfile');
    // Check gamesettings
    var settingsFile = 'playerdata/game_settings.json';
    var settings = new Object();
    jsonfile.readFile(settingsFile, function (err, settings) {
      if(err) console.error("Read error: " + err);
    });
    settings["playersCount"] += 1;
    jsonfile.writeFile(settingsFile, settings, function (err) {
      if (err) console.error("Write error: " + err);
    });

    //Message Author:
    var uName = message.author.username;

    //Resources
    var resourceFile = 'playerdata/user_resources.json';
    var resources = new Object();
    resources[uName] = {
      name: uName,
      manpower: 1000,
      lumber: 1000,
      stone: 1000,
      iron: 1000,
      coins: 5000,
    };
    jsonfile.writeFile(resourceFile, resources, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log(resources);
    });

    //Army Composition
    var armyFile = 'playerdata/user_army.json';
    var army = new Object();
    army[uName] = {
      swordsmen: 100,
      spearmen: 0,
      archers: 0,
      crossbowmen: 0,
      light_cavalry: 0,
      heavy_cavalry: 0,
    };
    jsonfile.writeFile(armyFile, army, function (err) {
      if (err) console.error(err);
      if (DEBUG) console.log(army);
    });

    //Infrastructure
    var buildingsFile = 'playerdata/user_buildings.json';
    var buildings = new Object();
    buildings[uName] = {
      land: 3,
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


  }
  else if (message.content === 'playerInfo') {
    // Requires
    var jsonfile = require('jsonfile');
    var file = 'playerdata/user_resources.json';
    // Author Username
    var uName = message.author.username;

    // Display Resources
    var data = jsonfile.readFileSync(file);
    var msg = data[uName]['name'] + "'s Kingdom\n"
    + "----------Resources----------\n"
    + "Manpower:guardsman:: " + data[uName]['manpower'] + "\n"
    + "Lumber:evergreen_tree:: " + data[uName]['lumber'] + "\n"
    + "Stone:full_moon:: " + data[uName]['stone'] + "\n"
    + "Iron:white_medium_square:: " + data[uName]['iron'] + "\n"
    + "Coins: " + data[uName]['coins'] + "\n";

    // Display Army Comp
    file = 'playerdata/user_army.json'
    data = jsonfile.readFileSync(file);
    msg += "----------Army Composition----------\n"
    + "Swordsmen: " + data[uName]['swordsmen'] + "\n"
    + "Spearmen: " + data[uName]['spearmen'] + "\n"
    + "Archers: " + data[uName]['archers'] + "\n"
    + "Crossbowmen: " + data[uName]['crossbowmen'] + "\n"
    + "Light Cavalry: " + data[uName]['light_cavalry'] + "\n"
    + "Heavy Cavalry" + data[uName]['heavy_cavalry'] + "\n";

    // Send Message
    message.channel.sendMessage(msg);
  }
  else if (message.content === 'test') {

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

bot.login(token);
