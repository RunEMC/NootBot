import * as jsonfile from 'jsonfile';

export class GooseGame {
  // Message Info
  cmdArray:Array<string>;
  author;
  server;
  // Game Info
  cmdsList:string;
  gameInfo:string;
  returnMsg:string;
  // Players' Data
  playersFile:string;
  players; //Read/Write
  playerData;
  // Geese Data
  geeseData;

  constructor(cmdArray, author) {
    this.cmdArray = cmdArray;
    this.author = author;
    // Init player info
    this.playersFile = 'ggData/players.json';
    this.players = jsonfile.readFileSync(this.playersFile);
    this.playerData = this.players[author.id];
    if (this.playerData === undefined) this.createNewPlayer();
    // Init geese info
    this.geeseData = jsonfile.readFileSync('ggData/geese.json');
    // Init game info
    this.gameInfo =
    "--------------------Goose Game by RunEMC--------------------\n"+
    "Collect geese by buying basic ones from the shop.\n"+
    "Breed geese to get better and rarer geese.\n"+
    "Steal geese from other players, but if it fails you will lose coins.\n"+
    "Geese will drop materials and coins for upgrades and breeding.\n"+
    "Sell geese for materials and coins.\n"+
    "See commands list below for the commands you can use.\n"+
    "(More features to come! Feel free to help contribute: https://github.com/RunEMC/NootBot) \n";
    this.cmdsList =
    "--------------------Commands--------------------\n"+
    " - !gg help: Info on the game.\n"+
    " - !gg nest: Check your geese collection.\n"+
    " - !gg breed: Check breeding progress.\n"+
    " - !gg breed [goose] [goose]: Breed two geese.\n"+
    " - !gg eggs: Check hatching progress.\n"+
    " - !gg upgrade: Check upgrades available.\n"+
    " - !gg shop: Check the geese available for purchase.\n"+
    " - !rg buy [goose]: Purchase a goose.\n"+
    " - !rg sell [goose]: Sell a goose.\n";
  }

  

}
