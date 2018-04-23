import * as jsonfile from 'jsonfile';

export class SHGame {
  // Message Info
  cmdArray:Array<string>;
  author:Object;
  // Game Info
  cmdsList:string;
  gameInfo:string;
  returnMsg:string;
  // Players' Data
  playersFile:string;
  players:Object; //Read/Write
  playerData:Object;
  // Lobbies' Data
  lobbiesFile:string;
  lobbies:Object; //Read/Write
  lobbyData:Object;

  constructor(cmdArray, author) {
    this.cmdArray = cmdArray;
    this.author = author;
    // Init player info
    this.playersFile = 'shData/players.json';
    this.players = jsonfile.readFileSync(this.playersFile);
    this.playerData = this.players[author.id];
    // Init lobby info
    this.lobbiesFile = 'shData/lobbies.json';
    this.lobbies = jsonfile.readFileSync(this.lobbiesFile);
    this.lobbyData = this.lobbies[this.playerData.lobbyID];
    // Init game info
    this.returnMsg = "```\n";
    this.cmdsList =
    "--------------------General Commands--------------------\n"+
    "!sh help: Check the game info\n"+
    "!sh stats: Check your stats\n"+
    "!sh lobby join [Lobby Name]: Joins a game lobby\n"+
    "!sh lobby create [Lobby Name]: Create a new game lobby\n"+
    "!sh lobby: View a list of existing lobbies\n"+
    "!sh start: Starts a new game of sh (must be in a lobby with min. 5 people)\n"+
    "--------------------In-Game Commands--------------------\n"+
    "!sh info: Check your role and affiliation\n"+
    "!sh choose [chancellor/president] [username]: Choose your chancellor or president\n"+
    "!sh vote [yes/no]: Vote on the chancellor (please PM this to the bot)\n"+
    "!sh discard [policy number]: Discard the coresponding policy (If you are the chancellor, the non-discarded policy will be played)\n"+
    "!sh accuse: \n"+
    "!sh endturn: Find out who we are still waiting on\n";
  }

  public processCommand() {
    var firstWord = this.cmdArray[0];
    if (firstWord !== undefined) {
      if (firstWord === "lobby") {

      }
      else if (firstWord === "stats") {

      }
      else {
        if (this.playerData.inLobby) { // Make sure the player is in a lobby
          if (firstWord === "start") {
            var lobbyID = this.playerData.lobbyID;
            var players = this.lobbyData.players;
            if (players.length >= 5) {
              this.lobbyData.started = true;
              this.playerData.inGame = true;
            }
            else {
              this.returnMsg += "Not enough players to start the game (currently: "+players.length+")\n";
            }
          }
        }
        else {
          this.returnMsg += "Invalid command or you are currently not in a lobby. Use !sh help for game info and the commands list\n";
        }
      }
    }
    else {
      this.returnMsg += this.cmdsList;
    }

    // Finish msg block
    this.returnMsg += "```\n";
    // Update player/lobby json files
    this.players[this.author.id] = this.playerData;
    jsonfile.writeFile(this.playersFile, this.players, function (err) {
      if (err) console.error("Write error: " + err);
    });
    this.lobbies[this.playerData.lobbyID] = this.lobbyData;
    jsonfile.writeFile(this.lobbiesFile, this.lobbies, function (err) {
      if (err) console.error("Write error: " + err);
    });
  }

  private getPlayerStats() {
    this.returnMsg +=
    "--------------------"+playerData.name+"'s Stats--------------------\n";
  }
}
