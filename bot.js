const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require('./token.js');
const NationGame = require('./nationgame.js');
const RogueGame = require('./rogue.js');

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
  // Kingdom Game
  else if (message.content === 'newNation') {
    var nationinfo = NationGame.NewNation(message.author.username);
    message.channel.sendMessage(nationinfo);
  }
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

  // Rogue like adventure game
  else if (message.content === 'sendHelp') {
    var msg =
    "------Commands------\n" +
    "newPlayer: Start a new game\n" +
    "playerInfo: Look at your player's info";

    message.channel.sendMessage(msg)
  }
  else if (message.content === 'newPlayer') {
    var msg = RogueGame.NewPlayer(message.author.username);
    message.channel.sendMessage(msg);
  }
  else if (message.content === 'playerInfo') {
    var msg = RogueGame.PlayerInfo(message.author.username);
    message.channel.sendMessage(msg);
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
