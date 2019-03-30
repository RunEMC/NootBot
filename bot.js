// import * as RogueGamet from './roguetest';

const Discord = require('discord.js');
const botToken = require('./botToken.json');
const botSettings = require('./botSettings.json');
// const Sanitizer = require('sanitizer');
//const NationGame = require('./nationgame.js');
const RogueGame = require('./rogue.js').RogueGame;
const SHGame = require('./sh.js').SHGame;
const GooseGame = require('./goosegame.js').GooseGame;
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');

const youtubeSearchOptions = {
  maxResults: '1',
  type: 'video',
  key: botToken.youtubeApiKey
}

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

// Persistent Data
var songQueue = [];

// Store the log for roguegame
var rogueGameLog;

// Flag variables
var lastMsgChannel;

bot.on('message', message => {
  var msgContent = message.content;
  var msgAuthor = message.author;
  var msgChannel = message.channel;
  var authUser = msgAuthor.username;
  var serverGuild = message.channel.guild;
  var vChan = message.member.voiceChannel;

  // Set last msg channel
  lastMsgChannel = msgChannel;

  // Check that the message is not sent by a bot
  if (!msgAuthor.bot) {

    // Get the command as an array of strings
    var commandArray = msgContent.split(" ");

    // Assuming messages will always have content, might need to check this
    if (msgContent.startsWith('!')) {
      // Process the message as a command
      var command = commandArray[0].substring(1);
      switch (command) {
        // Basic commands
        case "help":
          message.channel.send('Test');
          break;

        case "listsongs":
          if (songQueue.length > 0) {
            var msg = "Currently in queue:";
            songQueue.forEach(songInfo => {
              msg += "\n" + songInfo.url;
            });
            message.channel.send(msg);
          } else {
            message.channel.send('There are currently no songs in queue');
          }
          break;
          
        case "addsong":
          // Check that the author typed a query
          if (commandArray.length > 1) {
            // Try join msg author's channel
            if (vChan != undefined) {
              vChan.join()
              .then(connection => {
                // Create search term
                var searchTerm = msgContent.substring("!addsong ".length);
                AddSong(msgChannel, searchTerm, connection);
              })
              .catch(error => console.error(error.stack));
            } else {
              msgChannel.send("You're not in a channel for me to join!");
            }
          } else {
            msgChannel.send("Invalid command usage, !addsong [url]");
          }
          break;

        case "play":
          // Check that there is a voice connection
          if (vChan.connection != undefined && vChan.connection.dispatcher.paused) {
            vChan.connection.dispatcher.resume()
            .catch(error => console.error(error.stack));
          } else {
            msgChannel.send("There is nothing paused right now.");
          }
          break;

        case "pause":
          // Check that there is a voice connection
          if (vChan.connection != undefined && !vChan.connection.dispatcher.paused) {
            vChan.connection.dispatcher.pause()
            .catch(error => console.error(error.stack));
          } else {
            msgChannel.send("There is nothing playing right now.");
          }
          break;

        case "die":
          message.channel.send("Goodbye!");
          bot.destroy();
          throw new Error("Bot is ded x_x");

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
});

// Auto play next song if possible
if (bot.voiceConnections.length > 0) {
  bot.voiceConnections.forEach(player => {
    player.dispatcher.on("speaking", (user, isSpeaking) => {
      if (!isSpeaking && !player.dispatcher.paused && songQueue.length > 0) {
        console.log("Plaing: " + songQueue);
        playSong(lastMsgChannel, player);
      }
    });
  });
}

function AddSong(msgChannel, searchTerm, connection) {
  // Create new songinfo to pushinto queue
  var songInfo = {
    stream: undefined,
    url: "",
    searchQuery: searchTerm
  };

  // Check if searchTerm is a url
  if (searchTerm.startsWith("https://www.youtube.com/watch?v=") && searchTerm.substring("https://www.youtube.com/watch?v=".length).length == 11) {
    // Add to queue and play if no song is in queue
    songInfo.stream = ytdl(searchTerm, { filter: 'audioonly' });
    songInfo.url = searchTerm;
    songQueue.push(songInfo);
    msgChannel.send("Song added to queue! Type !listsongs to see the queue.");
    if (connection.dispatcher != undefined) return;

    // Didn't return, so play song
    playSong(msgChannel, connection);
  } else {
    // Search for and play result
    youtubeSearch(searchTerm, youtubeSearchOptions, (err, results) => {
      // Return if error
      if (err) return console.log("Search Error: " + err);

      // If results are fine, then play audio
      if (results != undefined && results.length >= 1) {
        var songUrl = "https://www.youtube.com/watch?v=" + results[0].id;

        // Add to queue and play if no song is in queue
        songInfo.stream = ytdl(songUrl, { filter: 'audioonly' });
        songInfo.url = songUrl;
        songQueue.push(songInfo);
        msgChannel.send("Song added to queue! Type !listsongs to see the queue.");
        if (connection.dispatcher != undefined) return;

        // Didn't return, so play song, need this in here to wait for search to finish
        playSong(msgChannel, connection);
      } else {
        msgChannel.send("No results found!");
      }
    });
  }
}

function playSong(msgChannel, vConnection) {
  var songInfo = songQueue.shift();
  // Send msg to channel
  msgChannel.send("Now playing: " + songInfo.url);
  vConnection.playStream(songInfo.stream);
}

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
