import * as jsonfile from 'jsonfile';

const millisecondsInSecond = 1000;

export class RogueGame {
  // Message Info
  cmdArray:Array<string>;
  username:string;
  // Return Msg
  returnMsg:string = "```";
  exploreLog:string = "```";
  // Players' Data
  playersFile = 'roguedata/player_stats.json';
  players = jsonfile.readFileSync(this.playersFile); //Read/Write
  playerData = this.players[this.username];
  // Locations' Data
  locations = jsonfile.readFileSync('roguedata/locations.json'); //Read only
  location:string;
  locationData = this.locations.grassyfields; // Tempdata, will get populated
  mobs = [];
  items = [];
  // Mobs' Data
  mobsData = jsonfile.readFileSync('roguedata/mobs.json'); //Read only
  // Items' Data
  itemsData = jsonfile.readFileSync('roguedata/items.json'); //Read only
  // Encounter Data
  mobEncounters = {};
  newMobEncounters ={};
  itemEncounters = {};
  isPlayerDead:boolean = false;

  constructor(cmdArray, username) {
    this.cmdArray = cmdArray;
    this.username = username;
  }

  public runGame() {
    this.playerData = this.players[this.username];
    this.playerRecover(); // Recover some player hp based on time passed
    if (this.cmdArray.length) {
      if (matchCase(this.cmdArray[0], "explore")) { // If !rg explore
        if (this.cmdArray.length > 1) {
          // Get the time left from the previous exploration
          var timeLeft = Math.floor((this.playerData.exploreEndTime - this.playerData.exploreStartTime)/millisecondsInSecond);
          if (timeLeft <= 0) { // Allow new exploration only if time is passed
            // Set the location once determined
            this.location = this.cmdArray[1].toLowerCase();
            // Check that the location name is valid
            if (this.locations[this.location] === undefined) {
              this.returnMsg +=
              "Invalid location, use example: !rg explore grassyfields\n" +
              "------Explorable Locations (!rg explore [location])------\n"+
              "Grassy Fields (lvl 1) - [grassyfields]";
            }
            else { // Location name is valid
              this.locationData = this.locations[this.location];
              this.mobs = this.locationData.mobs;
              this.items = this.locationData.items;
              // Begin exploring the location
              this.exploreLog += "--------------------"+this.locationData.displayName+"--------------------\n"
              this.explore();
            }
          }
          else {
            this.returnMsg +=
            "Exploration in progress, time remaining: "+timeLeft+" seconds\n";
          }
        }
        else { // If no area chosen
          this.returnMsg += "------Explorable Locations (!rg explore [location])------\n" +
                      "Grassy Fields (lvl 1) - [grassyfields]";
        }
      }
      else if (matchCase(this.cmdArray[0], "log")) { // If !rg log
        return "sendLog";
      }
      else if (matchCase(this.cmdArray[0], "help")) { // If !rg help
        this.returnMsg += "--------------------Commands--------------------\n"+
                    " - !rg explore [area]: Explore an area.\n"+
                    " - !rg help: Info on the game.\n"+
                    " - !rg stats [allocate] [str/dex/int/fort] [amount]: Check your stats and allocate new stat points."
      }
      else if (matchCase(this.cmdArray[0], "stats")) { // If !rg stats
        if (this.cmdArray > 1) {
          if (matchCase(this.cmdArray[1], "allocate")) { // Assign skillpoints
            if (this.cmdArray > 2) { // If !rg stats allocate
              if (this.playerData[this.cmdArray[2]] !== undefined) {
                if (this.cmdArray > 3) {
                  if (typeof this.cmdArray[3] === "number" && this.cmdArray[3] > 0) {
                    this.playerData[this.cmdArray[2]]+=this.cmdArray[3];
                  }
                  else {
                    this.returnMsg += "Invalid number, example usage: !rg stats allocate str 2";
                  }
                }
                else {
                  this.returnMsg += "Please enter the amount to allocate, example usage: !rg stats allocate str 2";
                }
              }
              else {
                this.returnMsg += "Invalid stat, example usage: !rg stats allocate str 2";
              }
            }
            else { // nothing after !rg stats allocate
              this.returnMsg += "Invalid stats, example usage: !rg stats allocate str 2";
            }
          }
        }
        else {
          // Update returnMsg with the player's stats
          this.getPlayerStats();
        }
      }
    }
    else { // Handles no parameters (just !rg)
      this.returnMsg += "--------------------Commands--------------------\n"+
                  " - !rg explore [area]: Explore an area.\n"+
                  " - !rg help: Info on the game.\n"+
                  " - !rg stats [allocate] [str/dex/int/fort] [amount]: Check your stats and allocate new stat points."
    }
    this.returnMsg += "```";
    this.exploreLog+= "```";
    return "sendMessage";
  }

  private explore() {
    // Set exploration start time
    var startTime = playerData.exploreStartTime = Date.now();
    playerData.exploreEndTime = startTime + (millisecondsInSecond * this.locationData.time);

    // Prepopulate fields
    for (var i = 0; i < this.mobs.length; i++) {
      var mob = this.mobs[i];
      this.mobEncounters[mob] = 0;
    }
    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      this.itemEncounters[item] = 0;
    }

    // Spawn mobs/items for each stage
    for (var i = 0; i < this.locationData.stages; i++) {
      this.exploreLog += "--------------------Stage "+(i+1)+"--------------------\n"

      this.spawnMobs();

      this.fightMobs();

      if (this.isPlayerDead) break;

      this.spawnItems();
    }

    // Write to file
    this.players[this.username] = this.playerData;
    jsonfile.writeFile(this.playersFile, this.players, function (err) {
      if (err) console.error("Write error: " + err);
    });

    // Create flavor text
    this.returnMsg += "\nWhile exploring " + this.locationData.displayName + " you defeated:\n"
    for (var i = 0; i < this.locationData.mobs.length; i++) {
      var mob = this.locationData.mobs[i]
      this.returnMsg += " - " + this.mobsData[mob].displayName + ": " + this.mobEncounters[mob] + "\n";
    }

    this.returnMsg += "\nYou acquired:\n"
    for (var i = 0; i < this.locationData.items.length; i++) {
      var item = this.locationData.items[i]
      this.returnMsg += " - " + this.itemsData[item].displayName + ": " + this.itemEncounters[item] + "\n";
    }
  }

  private spawnMobs() {
    for (var i = 0; i < this.mobs.length; i++) {
      var mob = this.mobs[i];
      var randNum = Math.random();

      if (this.locationData.mobSpawnChance[mob] >= randNum) {
        this.newMobEncounters[mob] = 1;
      }
    }
  }

  private spawnItems() {
    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var randNum = Math.random();

      if (this.locationData.itemSpawnChance[item] >= randNum) {
        this.itemEncounters[item] === undefined ? this.itemEncounters[item] = 1 : this.itemEncounters[item]++;
        // Add the acquired items to the player's inventory
        this.playerData.inventory[item] === undefined ? this.playerData.inventory[item] = 1 : this.playerData.inventory[item]++;
      }
    }
  }

  // Simulate a fight between the player and the mobs
  private fightMobs() {
    for (var i = 0; i < this.mobs.length; i++) {
      var mob = this.mobs[i];
      var mobStats = this.mobsData[mob];
      var mobAmount = this.newMobEncounters[mob];
      for (var j = 0; j < mobAmount; j++) {
        var mobHp = mobStats.hp;
        var playerHp = this.playerData.hpCur;
        // Fight mob till mob or player dies
        while (mobHp > 0) {
          mobHp -= this.playerData.atk;
          this.exploreLog += "You attack the " + mobStats.displayName + " for " + this.playerData.atk + " damage (" + Math.max(0, mobHp) + "/" + mobStats.hp + ")\n";
          // Check if mob is dead
          if (mobHp <= 0) {
            // Mob is defeated
            this.mobEncounters[mob] === undefined ? this.mobEncounters[mob] = 1 : this.mobEncounters[mob]++;
            this.playerData.hpCur = playerHp;
            this.playerData.expCur += mobStats.xpGain;
            // Add algorithms for determining xp required for next lvl and pts gain per lvl
            if (this.playerData.expCur >= this.playerData.expNext) {
              this.playerData.expCur -= this.playerData.expNext;
              this.playerData.skillpts++;
              this.playerData.level++;
              this.exploreLog += "\nYou leveled up!\n";
            }
            break;
          }
          // Mob attacks player
          playerHp -= mobStats.atk + this.playerData.def;
          this.exploreLog += "The " + mobStats.displayName + " attacks you for " + mobStats.atk + " damage (" + Math.max(0, playerHp) + "/" + this.playerData.hpMax + ")\n";
          // Check if player is dead
          if (playerHp <= 0) {
            this.playerData.hpCur = 0;
            this.isPlayerDead = true;
            this.exploreLog += "\nYou died!\n";
            this.returnMsg += "\nYou died!\n";
            break;
          }
        }
      }
    }
  }

  private getPlayerStats() {
    var stats = this.playerData;
    this.returnMsg +=
    "\n--------------------"+this.username+"\'s Stats--------------------\n"+
    "Level: "+stats.level+"\tExp: "+stats.expCur+"/"+stats.expNext+"\n"+
    "HP: "+stats.hpCur+"/"+stats.hpMax+"\tMP: "+stats.mpCur+"/"+stats.mpMax+"\n"+
    "HP Recovery: "+stats.hpRec+"/"+stats.hpRecTime+"sec\tMP Recovery: "+stats.mpRec+"/"+stats.mpRecTime+"sec\n";
    "Atk: "+stats.atk+"\tDef: "+stats.def+"\n"+
    "Strength: "+stats.str+"\tDexterity: "+stats.dex+"\n"+
    "Intelligence: "+stats.int+"\tFortitude: "+stats.fort+"\n"+
    "Stat Points Available: "+stats.skillpts+"\n"+
    "\n--------------------"+this.username+"\'s Inventory--------------------\n";
    for (item in stats.inventory) {
      this.returnMsg += "- "+this.itemsData[item].displayName+": "+this.itemsData[item].description+"\n";
    }
  }

  private playerRecover() {
    // Make sure player is missing health
    if (this.playerData.hpCur < this.playerData.hpMax) {
      var timePassed = Date.now() - (this.playerData.lastRecoveryTime + this.playerData.hpRecTime);
      if (timePassed >= 0) {
        var hpMuliplier = Math.floor((timePassed/millisecondsInSecond)/this.playerData.hpRecTime);
        var recovery = this.playerData.hpCur+(this.playerData.hpRec*hpMuliplier);
        this.playerData.hpCur = Math.min(this.playerData.hpMax, recovery);

        // Update recoverytime
        var leftOverTime = timePassed-(this.playerData.hpRecTime*hpMuliplier);
        this.playerData.lastRecoveryTime = Date.now() - leftOverTime;
      }
    }
    // Do the same thing for mp
  }
}

// Checks if two strings are equal regardless of case
function matchCase(str1, str2) {
  return str1.toUpperCase() === str2.toUpperCase();
}
