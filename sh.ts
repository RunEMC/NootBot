import * as jsonfile from 'jsonfile';
import * as Discord from 'discord';

const _maxPlayers = 10;

export class SHGame {
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
  // Lobbies' Data
  lobbiesFile:string;
  lobbies; //Read/Write
  lobbyData;

  constructor(cmdArray, author, server) {
    this.cmdArray = cmdArray;
    this.author = author;
    this.server = server;
    // Init player info
    this.playersFile = 'shData/players.json';
    this.players = jsonfile.readFileSync(this.playersFile);
    this.playerData = this.players[author.id];
    if (this.playerData === undefined) this.createNewPlayer();
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

  public getReturnMsg() {
    return this.returnMsg;
  }


  public processCommand() {
    var firstWord = this.cmdArray[0];
    if (firstWord !== undefined) {
      if (firstWord === "stats") {
        this.returnMsg += this.getPlayerStats();
      }
      else if (firstWord === "help") {
        this.returnMsg += (this.gameInfo === undefined?"":this.gameInfo) + "\n" + this.cmdsList;
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
            if (players.length >= 5 && !this.playerData.inGame) {
              this.startGame();
            }
            else if (this.playerData.inGame) {
              this.returnMsg += "The game has already started\n";
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

  private createNewPlayer() {
    var player = {
      "name":this.author.username,
      "id":this.author.id,
      "gamesPlayed":0,
      "wins":0,
      "loses":0,
      "liberalTimes":0,
      "inLobby":false,
      "lobbyName":"",
      "inGame":false,
      "affiliation":"unassigned"
    }
    this.playerData = player;
  }

  private getPlayerStats() {
    var stats =
    "--------------------"+this.playerData.name+"'s Stats--------------------\n"+
    "Games Played: "+this.playerData.gamesPlayed+"\n"+
    "Wins: "+this.playerData.wins+"\n"+
    "Loses: "+this.playerData.loses+"\n"+
    "Times Liberal: "+this.playerData.liberalTimes+"\n";
    if (this.playerData.inLobby) {
      stats+="Current Lobby: "+this.playerData.lobbyName+"\n";
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
        "players": [this.playerData]
      }
      this.lobbies[lobbyName] = lobby;

      this.returnMsg += "Lobby "+lobbyName+" created!\n";
    }
  }

  private joinLobby(lobbyName) {
    if (this.playerData.inLobby === true) {
      if (this.lobbyData.players.length <= _maxPlayers) {
        this.lobbyData.players.push(this.playerData);
        this.playerData.inLobby = true;
        this.playerData.lobbyName = lobbyName;

        this.returnMsg += "Joined lobby "+lobbyName+"\n";
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

        var lobbyName = this.playerData.lobbyName;
        this.playerData.inLobby = false;
        this.playerData.lobbyName = "";

        this.returnMsg += "Left lobby "+lobbyName+"\n";
      }
      else {
        this.returnMsg += "You are currently in a game\n";
      }
    }
    else {
      this.returnMsg += "You are not currently in a lobby\n";
    }
  }

  private startGame() {
    this.lobbyData.started = true;
    // Assign affiliation
    // Lib-to-players: floor((players + 2) / 2 )
    // Players: 5   6   7   8   9   10
    // Libs:    3   4   4   5   5   6
    // Fascs:   2   2   3   3   4   4
    var playersAmt = this.lobbyData.players.length;
    var libsAmt = Math.floor((playersAmt + 2)/2);
    var fasAmt = playersAmt - libsAmt;
    randomizeArray(this.lobbyData.players);
    var shChance = 1/fasAmt;
    var randNum = Math.random();
    var fas = {
      "players":[],
      "playerNames":[],
      "sh":"",
      "shID":"",
    };

    for (var i = 0; i < this.lobbyData.players) {
      if (libsAmt > 0) {
        this.lobbyData.players[i].affiliation = "lib";
        libsAmt--;
        // Send out PM to players
        var affil = this.lobbyData.players[i].affiliation;
        this.server.fetchMember(this.lobbyData.players[i].id).then(
          (member) => {
            var msg = "```\n"+
            "You have been assigned liberal\n"+
            "Work with your fellow liberals to win\n"+
            "```\n";
            member.send(msg);
          }
        );
      }
      else {
        this.lobbyData.players[i].affiliation = "fas";
        fasAmt--;
        // Possibly assign sh
        if (randNum <= shChance) {
          this.lobbyData.sh = this.lobbyData.players[i].id;
          shChance = -1;
          fas.shID = this.lobbyData.players[i].id;
          fas.sh = this.lobbyData.players[i].name;
          this.server.fetchMember(this.lobbyData.players[i].id).then(
            (member) => {
              var msg = "```\n"+
              "You are the SH!\n"+
              "```\n";
              member.send(msg);
            }
          );
        }
        else {
          randNum -= shChance;
        }
        fas.players.push(this.lobbyData.players[i].id)
        fas.playerNames.push(this.lobbyData.players[i].name)
      }

      // Update playerdata
      this.lobbyData.players[i].inGame = true;
      this.lobbyData.players[i].gamesPlayed = true;
      this.players[i] = this.lobbyData.players[i];
    }
    // Send PM to fas of team mates
    for (var i = 0; i < fas.players.length; i++) {
      this.server.fetchMember(this.lobbyData.players[i].id).then(
        (member) => {
          var msg = "```\n"+
          "You have been assigned fasc\n"+
          "The fascs are: \n";
          for (var j = 0; j < fas.playerNames.length; j++) {
            msg += " - "+fas.playerNames[j]+"\n";
          }
          msg += "SH is "+fas.sh+"\n```";
          member.send(msg);
        }
      );
    }

    // Randomize player order
    randomizeArray(this.lobbyData.players);
    this.returnMsg += "The order of play will be:\n";
    // Assign president
    this.lobbyData.chancellor = this.playerData.players[0].id;
    this.returnMsg+="1: "+this.playerData.players[0].name+" (Chancellor)\n";
    for (var i = 1; i < this.playerData.players) {
      this.returnMsg+=(i+1)+": "+this.playerData.players[i].name+"\n";
    }
  }

}


// Performs the Fisher-Yates shuffle to randomize an array in O(n) time
function randomizeArray(arr) {
  var m = arr.length;
  var t;
  var i;

  // Go through the array
  while (m) {
    // Pick a random element to swap
    i = Math.floor(Math.random() * m--);

    // Swap the two elements
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }

  return arr;
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
