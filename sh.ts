import * as jsonfile from 'jsonfile';

export class SHGame {
  // Message Info
  cmdArray:Array<string>;
  username:string;
  // Game Info
  cmdsList:string;
  gameInfo:string;
  returnMsg:string;
  // Players' Data
  playersFile:string = 'shData/players.json';
  players:Object = jsonfile.readFileSync(this.playersFile); //Read/Write
  playerData:Object;
  // Lobbies' Data
  lobbiesFile:string = 'shData/lobbies.json';
  lobbies:Object = jsonfile.readFileSync(this.lobbiesFile); //Read/Write
  lobbyData:Object;

  constructor(cmdArray, username) {
    this.cmdArray = cmdArray;
    this.username = username;
    // Init game info
    this.playerData = this.players[username];
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
            var lobby = this.playerData.lobbyID;
            if ()
          }
        }
        else {
          this.returnMsg += "Invalid command, or you are currently not in a lobby. Use !sh help for game info and the commands list\n";
        }
      }
    }
    else {
      this.returnMsg += this.cmdsList;
    }

    this.returnMsg += "```\n";
  }
}
