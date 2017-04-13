const Discord = require('discord.js');
const bot = new Discord.Client();
const token = "MTc3MTc3ODgwNjkyOTE2MjI1.CgqxkA.tN-6-EssqGux38sScsLXY4up2uo";

//const hook = new Discord.WebhookClient('webhook id', 'webhook token');

//hook.sendMessage('I am now alive!');

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
  else if (message.content === 'spawn') {

  }
});

bot.login(token);
