var discord = require("discord.js");        // discord library
var ytdl = require('ytdl-core');            // youtube download library
var youtube = require('./youtube.js');      // performs youtube API requests

var bot = new discord.Client();
var ytAudioQueue = [];
var dispatcher = null;

bot.on('ready', function () {
    console.log('I am ready');
});

bot.on('message', function (message) {
    var messageParts = message.content.split(' ');

    var command = messageParts[0].toLowerCase();
    var parameters = messageParts.splice(1, messageParts.length);

    console.log("command: " + command);
    console.log("parameters: " + parameters);

    switch (command) {
        case "hi":
            message.reply("Hey there!");
            break;
        case "*help":
            HelpCommand(message);
            break;
        case "*join":
            message.reply("Attempting to join channel: " + parameters[0]);
            JoinCommand(parameters[0]);
            break;
        case "*play":
            PlayCommand(parameters.join(" "), message);
            break;
        case "*playqueue":
            PlayQueueCommand(message);
            break;
    }
});

/* COMMAND HANDLERS */

/// lists out all of the bot commands
function HelpCommand(originalMessage) {
    originalMessage.reply("*join <channel-to-join> - Connects to bot to a channel by channel name");
    originalMessage.reply("*play <YouTube search term> - Plays audio from YouTube based on the search term");
    originalMessage.reply("*playqueue - Lists the audio remaining in the play queue");
}

/// plays audio based on results from youtube search
function PlayCommand(searchTerm) {

    // if not connected to a voice channel then connect to first one
    if (bot.voiceConnections.array().length == 0) {
        var defaultVoiceChannel = bot.channels.find(val => val.type === 'voice').name;
        JoinCommand(defaultVoiceChannel);
    }

    // search youtube using the given search search term and perform callback action if video is found
    youtube.search(searchTerm, QueueYtAudioStream);
}

/// lists out all music queued to play
function PlayQueueCommand(message) {
    var queueString = "";

    for(var x = 0; x < ytAudioQueue.length; x++) {
        queueString += ytAudioQueue[x].videoName + ", ";
    }

    queueString = queueString.substring(0, queueString.length - 2);
    message.reply(queueString);
}

/// joins the bot to the specified voice channel
function JoinCommand(channelName) {
    var voiceChannel = GetChannelByName(channelName);

    if (voiceChannel) {
        voiceChannel.join();
        console.log("Joined " + voiceChannel.name);
    }

    return voiceChannel;
}

/* END COMMAND HANDLERS */
/*----------------------------------------------------------------------*/
/* HELPER METHODS */

/// returns the channel that matches the name provided
function GetChannelByName(name) {
    var channel = bot.channels.find(val => val.name === name);
    return channel;
}

/// Queues result of Youtube search into stream
function QueueYtAudioStream(videoId, videoName) {
    var streamUrl = `${youtube.watchVideoUrl}${videoId}`;

    if (!ytAudioQueue.length) {
        ytAudioQueue.push(
            {
                'streamUrl': streamUrl,
                'videoName': videoName
            }
        );

        console.log("Queued audio " + videoName);
        PlayStream(ytAudioQueue[0].streamUrl);
    }
    else {
        ytAudioQueue.push(
            {
                'streamUrl': streamUrl,
                'videoName': videoName
            }
        );

        console.log("Queued audio " + videoName);
    }

}

/// Plays a given stream
function PlayStream(streamUrl) {

    const streamOptions = {seek: 0, volume: 1};

    if (streamUrl) {
        const stream = ytdl(streamUrl, {filter: 'audioonly'});

        if (dispatcher == null) {

            var voiceConnection = bot.voiceConnections.first();
            //console.log(voiceConnection);

            if (voiceConnection) {

                console.log("Now Playing " + ytAudioQueue[0].videoName);
                dispatcher = bot.voiceConnections.first().playStream(stream, streamOptions);

                dispatcher.on('end', () => {
                    PlayNextStreamInQueue();
                });

                dispatcher.on('error', (err) => {
                    console.log(err);
                });
            }
        }
        else {
            dispatcher = bot.voiceConnections.first().playStream(stream, streamOptions);
        }
    }
}

/// Plays the next stream in the queue
function PlayNextStreamInQueue() {

    ytAudioQueue.splice(0, 1);

    // if there are streams remaining in the queue then try to play
    if (ytAudioQueue.length != 0) {
        console.log("Now Playing " + ytAudioQueue[0].videoName);
        PlayStream(ytAudioQueue[0].streamUrl);
    }
}
/* END HELPER METHODS */

bot.login("redacted");
