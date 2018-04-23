import * as jsonfile from 'jsonfile';

const _maxPlayers = 8;

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
    this.lobbyData = this.lobbies[this.playerData.lobbyName];
    // Init game info
    this.returnMsg = "```\n";
    this.cmdsList =
    "--------------------General Commands--------------------\n"+
    "!sh help: Check the game info\n"+
    "!sh stats: Check your stats\n"+
    "!sh lobby join [Lobby Name]: Joins a game lobby, creates a new one if it doesn't exist\n"+
    "!sh lobby create [Lobby Name]: Create a new game lobby, make sure that the lobby name is one word\n"+
    "!sh lobby leave: Leave your current lobby\n"+
    "!sh lobby: View a list of existing lobbies\n"+
    "!sh start: Starts a new game of sh (must be in a lobby with min. 5 people)\n"+
    "--------------------In-Game Commands--------------------\n"+
    "!sh info: Check your role and affiliation\n"+
    "!sh choose [chancellor/president] [User ID]: Choose your chancellor or president\n"+
    "!sh vote [yes/no]: Vote on the chancellor (please PM this to the bot)\n"+
    "!sh discard [policy number]: Discard the coresponding policy (If you are the chancellor, the non-discarded policy will be played)\n"+
    "!sh accuse: \n"+
    "!sh log: Displays the events that have occured until now\n"+
    "!sh endturn: Find out who we are still waiting on\n";
  }

  public processCommand() {
    var firstWord = this.cmdArray[0];
    if (firstWord !== undefined) {
      if (firstWord === "stats") {
        this.returnMsg += this.getPlayerStats();
      }
      else if (firstWord === "help") {
        this.returnMsg = this.gameInfo + "\n" + this.cmdsList;
      }
      else if (firstWord === "lobby") {
        var secondWord = this.cmdArray[1];
        if (secondWord !== undefined) {
          var thirdWord = this.cmdArray[2];
          if (secondWord === "create") {
            if (thirdWord !== undefined) {
              this.createNewLobby(thirdWord);
            }
            else {
              this.returnMsg += "Invalid lobby name, usage ex: !sh lobby create My_Lobby\n";
            }
          }
          else if (secondWord === "join") {
            if (thirdWord !== undefined) {
              this.joinLobby(thirdWord);
            }
            else {
              this.returnMsg += "Invalid lobby name, usage ex: !sh lobby join My_Lobby\n";
            }
          }
          else if (secondWord === "leave") {
            this.leaveLobby();
          }
        }
        else { // Display the list of lobbies
          this.returnMsg +=
          "--------------------Lobbies--------------------\n";
          for (var lobbyID in this.lobbies) {
            var lobby = this.lobbies[lobbyID];
            this.returnMsg += "["+lobbyID+"] - "+lobby.name+" ("+(lobby.started?"Started":lobby.players.length+"/"+_maxPlayers)+"): \n";
            for (var playerID = 0; playerID < lobby.players.length; playerID++) {
              this.returnMsg += "\t- "+lobby.players[playerID].name+"\n";
            }
          }
        }
      }
      else {
        if (this.playerData.inLobby) { // Make sure the player is in a lobby
          if (firstWord === "start") {
            var lobbyName = this.playerData.lobbyName;
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
    this.lobbies[this.playerData.lobbyName] = this.lobbyData;
    jsonfile.writeFile(this.lobbiesFile, this.lobbies, function (err) {
      if (err) console.error("Write error: " + err);
    });
  }

  private getPlayerStats() {
    stats =
    "--------------------"+playerData.name+"'s Stats--------------------\n"+
    "Games Played: "+playerData.gamesPlayed+"\n"+
    "Wins: "+playerData.wins+"\n"+
    "Loses: "+playerData.loses+"\n"+
    "Times Liberal: "+playerData.liberalTimes+"\n";
    if (playerData.inLobby) {
      msg+="Current Lobby: "+playerData.lobbyName+"\n";
    }
    return stats;
  }

  private createNewLobby(lobbyName) {
    if (this.playerData.inLobby === true) {
      this.returnMsg += "Lobby "+lobbyName+" already exists!\n";
    }
    else {
      var lobby = {
        "name":lobbyName,
        "started":false,
        "players": [
          {
            "name":this.playerData.name,
            "id":this.playerData.id,
            "affil":"unassigned",
            "sh":false
          }
        ]
      }
      this.lobbies[lobbyName] = lobby;
    }
  }

  private joinLobby(lobbyName) {
    if (this.playerData.inLobby === true) {
      if (this.lobbyData.players.length <= _maxPlayers) {
        var player = {
          "name":this.playerData.name,
          "id":this.playerData.id,
          "affil":"unassigned",
          "sh":false
        }
        this.lobbyData.players.push(player);
        this.playerData.inLobby = true;
        this.playerData.lobbyName = lobbyName;
      }
      else {
        this.returnMsg+="This lobby is full\n";
      }
    }
    else {
      this.createNewLobby(lobbyName);
    }
  }

  private leaveLobby() {
    if (this.playerData.inLobby === true) {
      if (this.playerData.inGame === false) {
        var playerPos = findObjInArray(this.playerData.id, "id", this.lobbyData.players);
        this.lobbyData.players.splice(playerPos, 1);

        this.playerData.inLobby = false;
        this.playerData.lobbyName = "";
      }
      else {
        returnMsg += "You are currently in a game\n";
      }
    }
    else {
      returnMsg += "You are not currently in a lobby\n";
    }
  }

}


// Finds the position of an object containing val as it's value for a certain field
function findObjInArray(val, field, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][field] === val) {
      return i;
    }
  }
  return -1;
}
