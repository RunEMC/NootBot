const Discord = require('discord.js');
const bot = new Discord.Client();
const token = "MTc3MTc3ODgwNjkyOTE2MjI1.CgqxkA.tN-6-EssqGux38sScsLXY4up2uo";

//const hook = new Discord.WebhookClient('webhook id', 'webhook token');

//hook.sendMessage('I am now alive!');

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

    //Resources
    var resourceFile = 'playerdata/user_resources.json';
    var resources = new Object();
    resources[message.author.username] = {
      name: message.author.username,
      manpower: 1000,
      lumber: 1000,
      stone: 1000,
      iron: 1000,
      bronze: 1000
    };
    jsonfile.writeFile(resourceFile, resources, function (err) {
      if (err) console.error(err);
    });
    //Army Composition
    var armyFile = 'playerdata/user_army.json';
    var army = {

    };


  }
  else if (message.content === 'playerInfo') {
    var jsonfile = require('jsonfile');
    var file = 'playerdata/user_resources.json';
    jsonfile.readFile(file, function (err, obj) {
      console.dir(obj);

      var msg = obj['name'] + "'s Kingdom's Statistics:\n"
      + "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
      + "Manpower:guardsman:: " + obj['manpower'] + "\n"
      + "Lumber:evergreen_tree:: " + obj['lumber'] + "\n"
      + "Stone:full_moon:: " + obj['stone'] + "\n"
      + "Iron:white_medium_square:: " + obj['iron'] + "\n"
      + "Bronze: " + obj['bronze'] + "\n";
      message.channel.sendMessage(msg);
    });
  }
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
});

bot.login(token);
