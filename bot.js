// import * as RogueGamet from './roguetest';

const Discord = require('discord.js');
const botToken = require('./botToken.json');
const botSettings = require('./botSettings.json');
// const Sanitizer = require('sanitizer');
//const NationGame = require('./nationgame.js');
const RogueGame = require('./rogue.js').RogueGame;
const SHGame = require('./sh.js').SHGame;
const GooseGame = require('./goosegame.js').GooseGame;

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

// Store the log for roguegame
var rogueGameLog;

bot.on('message', message => {
  var msg = message.content;
  var msgAuthor = message.author;
  var authUser = msgAuthor.username;
  var serverGuild = message.channel.guild;
  var vChan = message.member.voiceChannel;;

  // Check that the message is not sent by a bot
  if (!msgAuthor.bot) {

    // Get the command as an array of strings
    var commandArray = msg.split(" ");

    // Assuming messages will always have content, might need to check this
    if (msg[0] == '!') {
      // Process the message as a command
      var command = commandArray[0].substring(1);
      switch (command) {
        // Basic commands
        case "help":
          message.channel.send('Test');
          break;
          
        case "die":
          message.channel.send("Goodbye!");
          bot.destroy();
          break;

        // Roguelike game
        case "rg":
          startRogueLike(message);
          break;

        // Secret Harry
        case "sh":
          startSH(message);
          break;

        default:
          message.channel.send("Invalid command: " + command);
          break;
      }
    }
  }

  

  /*
  if (message.content === 'ping') {
    if (DEBUG) {
      message.channel.send('pong');
      message.reply(message.author.avatarURL);

      vChan = message.member.voiceChannel;
      if (vChan === undefined) {
        message.reply("You are not in a voice channel");
      }
      else {
        vChan.join().then(connection => {
          connection.playFile('audio/rickroll.mp3');
          console.log('Connected!');
        }).catch(console.error);
      }
    }
  }
  else if (message.content === 'rickrollme') {
    vChan = message.member.voiceChannel;

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
    leaveChan(vChan);
  }
  else if (message.content === 'quit') {
    leaveChan(vChan);
    bot.destroy();
  }
  else if (message.content === 'help') {
    var fs = require('fs');
    var files = fs.readdirSync('audio/');

    //console.log(files);
    message.channel.sendMessage(files);
  }
  else if (message.content.startsWith('!rg')) {
    var msg = "";

    var cmd = message.content.split(" ");
    cmd.splice(0, 1);

    var rogueGame = new RogueGame(cmd, authUser);
    var response = rogueGame.runGame();
    // Check response
    if (response === "sendLog") {
      msg = rogueGameLog;
    }
    else {
      msg = rogueGame.getReturnMsg();
      // Set the explore log if it is not nothing
      if (rogueGame.getExploreLog() != "") rogueGameLog = rogueGame.getExploreLog();
    }
    // Send message
    message.channel.send(msg);
  }
  else if (message.content.startsWith('!sh')) {
    var msg = "";

    var cmd = message.content.split(" ");
    cmd.splice(0, 1);

    var sHGame = new SHGame(cmd, msgAuthor, serverGuild);
    var response = sHGame.processCommand();
    msg = sHGame.getReturnMsg();
    // // Check response
    // if (response === "sendLog") {
    //   msg = rogueGameLog;
    // }
    // else {
    //   msg = rogueGame.getReturnMsg();
    //   // Set the explore log if it is not nothing
    //   if (rogueGame.getExploreLog() != "") rogueGameLog = rogueGame.getExploreLog();
    // }
    // // Send message
    message.channel.send(msg);
  }
  else if (message.content.startsWith('!gg')) {
    var msg = "";
    var cmd = message.content.split(" ");
    cmd.splice(0, 1);

    var gooseGame = new GooseGame(cmd, msgAuthor);
    var response = gooseGame.processCommand();
    msg = gooseGame.getReturnMsg();
    // Send message
    message.channel.send(msg);
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

    if (commands[0] == 'help') {
      // Help function
    }
    else if (commands[0] === 'test') {

    }

  }
  else if (message.content === '!ele') {
    // Help function
  }
  else if (message.content === 'getid') {
    message.channel.send(msgAuthor.id);
  }
*/
});


// Starts the client for secret harry (INCOMPLETE)
function startSH(message) {
  var msg = "";

    var cmd = message.content.split(" ");
    cmd.splice(0, 1);

    var sHGame = new SHGame(cmd, msgAuthor, serverGuild);
    var response = sHGame.processCommand();
    msg = sHGame.getReturnMsg();
    // // Check response
    // if (response === "sendLog") {
    //   msg = rogueGameLog;
    // }
    // else {
    //   msg = rogueGame.getReturnMsg();
    //   // Set the explore log if it is not nothing
    //   if (rogueGame.getExploreLog() != "") rogueGameLog = rogueGame.getExploreLog();
    // }
    // // Send message
    message.channel.send(msg);
}


// Starts the client for the rogue like game (INCOMPLETE)
function startRogueLike(message) {
  var msg = "";

  var cmd = message.content.split(" ");
  cmd.splice(0, 1);

  var rogueGame = new RogueGame(cmd, authUser);
  var response = rogueGame.runGame();
  // Check response
  if (response === "sendLog") {
    msg = rogueGameLog;
  }
  else {
    msg = rogueGame.getReturnMsg();
    // Set the explore log if it is not nothing
    if (rogueGame.getExploreLog() != "") rogueGameLog = rogueGame.getExploreLog();
  }
  // Send message
  message.channel.send(msg);
}


// Leave a channel
function leaveChan(voiceChan) {
  if (voiceChan !== undefined) {
    voiceChan.leave();
  }
}


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
