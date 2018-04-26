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
  }

}
