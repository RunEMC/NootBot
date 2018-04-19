import * as jsonfile from 'jsonfile';

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
    if (this.cmdArray.length) {
      if (matchCase(this.cmdArray[0], "explore")) { // If !rg explore
        if (this.cmdArray.length > 1) {
          // Set the location once determined
          this.location = this.cmdArray[1];
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
        else { // If no area chosen
          this.returnMsg += "------Explorable Locations (!rg explore [location])------\n" +
                      "Grassy Fields (lvl 1) - [grassyfields]";
        }
      }
      else if (matchCase(this.cmdArray[0], "log")) { // If !rg log
        return "sendLog";
      }
    }
    else { // Handles no parameters (just !rg)
      this.returnMsg += "--------------------Commands--------------------\n"+
                  " - !rg explore [area]: Explore an area.\n"+
                  " - !rg stats [allocate]: Check your stats and allocate new stat points."
    }
    this.returnMsg += "```";
    this.exploreLog+= "```";
    return "sendMessage";
  }

  public explore() {
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

  public spawnMobs() {
    for (var i = 0; i < this.mobs.length; i++) {
      var mob = this.mobs[i];
      var randNum = Math.random();

      if (this.locationData.mobSpawnChance[mob] >= randNum) {
        this.newMobEncounters[mob] = 1;
      }
    }
  }

  public spawnItems() {
    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var randNum = Math.random();

      if (this.locationData.itemSpawnChance[item] >= randNum) {
        this.itemEncounters[item] === undefined ? this.itemEncounters[item] = 1 : this.itemEncounters[item]++;
      }
    }
  }

  // Simulate a fight between the player and the mobs
  public fightMobs() {
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
}

// Checks if two strings are equal regardless of case
function matchCase(str1, str2) {
  return str1.toUpperCase() === str2.toUpperCase();
}
