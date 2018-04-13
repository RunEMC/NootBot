const Discord = require('discord.js');
const botToken = require('./botToken.json');
const botSettings = require('./botSettings.json');
//const NationGame = require('./nationgame.js');
//const RogueGame = require('./rogue.js');

// Create new bot client
const bot = new Discord.Client();
// Login the bot with token
bot.login(botToken.token);

//Debug mode?
const DEBUG = true;

// Log bot readiness
bot.on('ready', async () => {
  console.log(bot.user.username + ' is ready!');

  // Generate bot invite link
  try {
    let link = await bot.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
  }
  catch (e) {
    console.log(e.stack);
  }

});

// Message handler
bot.on('message', message => {
  if (DEBUG) {
    console.log("Message: " + message.content);
    console.log("Author: " + message.author.username + " (" + message.author.id + ")");
  }
});

/*
bot.on('message', message => {
  var authUser = Sanitizer.sanitize(message.author.username);

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
  else if (message.content.startsWith('play ')) {
    var song = message.content.split(" ");
    song.splice(0, 1);

    const vChan = message.member.voiceChannel;

    var filename = 'audio/' + song[0] + '.mp3';

    vChan.join().then(connection => {
      const dispatcher = connection.playFile(filename);
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
  else if (message.content === 'help') {
    var fs = require('fs');
    var files = fs.readdirSync('audio/');

    //console.log(files);
    message.channel.sendMessage(files);
  }
  else if (message.content === 'newNation') {
    var nationinfo = NationGame.NewNation(message.author.username);
    message.channel.sendMessage(nationinfo);
  }// Kingdom Game
  else if (message.content === 'nationInfo') {

    var nationinfo = NationGame.NationInfo(message.author.username);
    message.channel.sendMessage(nationinfo);

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
  else if (message.content === 'sendHelp') {
    var msg =
    "------Commands------\n" +
    "newPlayer: Start a new game\n" +
    "playerInfo: Look at your player's info";

    message.channel.sendMessage(msg)
  }// Rogue like adventure game
  else if (message.content === 'newPlayer') {
    var msg = RogueGame.NewPlayer(authUser);
    message.channel.sendMessage(msg);
  }
  else if (message.content === 'playerInfo') {
    var msg = RogueGame.PlayerInfo(authUser);
    message.channel.sendMessage(msg);
  }
  else if (message.content.startsWith('explore')) {

    var msg = "";

    // Get the location to explore
    var location = message.content.split(" ");
    location.splice(0, 1);
    if (location.length) {
      // Check if the player is already exploring
      // if ()

      // Check if the player is already in the location
      // if ()

      // Set the message
      msg = RogueGame.Explore(authUser, location[0]);
    }
    else {

      msg =
      "------Explorable Locations (explore [location])------\n" +
      "Sewers (lvl 1) - [sewers]";
    }
    message.channel.sendMessage(msg);

  }
  else if (message.content.startsWith('encounter')) {
    var msg = "";

    var options = message.content.split(" ");
    options.splice(0, 1);

    if (options.length) {
      msg += RogueGame.Encounter(authUser, options[0]);
    }
    else {
      msg += RogueGame.Encounter(authUser, 'help');
    }
    message.channel.sendMessage(msg);
  }
  else if (message.content.startsWith('!ele ')) { // Elements Incremental Game
    var commands = message.content.split(" ");
    commands.splice(0, 1);

    switch (commands[0]) {
      case 'help':
        //Help Function
        break;
      case 'combine':
        var elements = commands;
        elements.slice(0, 1);
        break;
      default:

    }

    if(commands[0] == 'help') {
      // Help function
    }
    else if (commands[0] === )

  }
  else if (message.content === '!ele') {
    // Help function
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
*/

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
