import * as jsonfile from 'jsonfile';

const millisecondsInSecond = 1000;

export class RogueGame {
  // Message Info
  cmdArray:Array<string>;
  username:string;
  // Game Info
  gameInfo:string;
  cmdsList:string;
  locationsList:string;
  // Return Msg
  returnMsg:string;
  exploreLog:string;
  // Players' Data
  playersFile:string;
  players; //Read/Write
  playerData;
  // Shop Data
  shopFile:string;
  shopData; // Read/Write
  shopSettings; // Read only
  // Locations' Data
  locations; //Read only
  location:string;
  locationData; // Tempdata, will get populated
  mobs = [];
  items = [];
  // Mobs' Data
  mobsData; //Read only
  // Items' Data
  itemsData; //Read only
  // Encounter Data
  mobEncounters = {};
  newMobEncounters ={};
  itemEncounters = {};
  isPlayerDead:boolean = false;
  // Base Stats, constants, only modify if base stats needs to be changed
  baseXpNeeded = 10;
  baseAtk = 3;
  baseDef = 1;
  baseHp = 10;
  baseHpRec = 1;
  baseHpRecTime = 15;
  baseMp = 0;


  constructor(cmdArray, username) {
    this.cmdArray = cmdArray;
    this.username = username;
    // Return val
    this.returnMsg = "```\n";
    this.exploreLog = "";
    // Player Data
    this.playersFile = 'roguedata/player_stats.json';
    this.players = jsonfile.readFileSync(this.playersFile); //Read/Write
    this.playerData = this.players[this.username];
    // Shop Data
    this.shopFile = 'roguedata/shop.json';
    this.shopData = jsonfile.readFileSync(this.shopFile); //Read/Write
    this.shopSettings = jsonfile.readFileSync('roguedata/shopSettings.json'); //Read only
    // Various Game Data
    this.locations = jsonfile.readFileSync('roguedata/locations.json'); //Read only
    this.mobsData = jsonfile.readFileSync('roguedata/mobs.json'); //Read only
    this.itemsData = jsonfile.readFileSync('roguedata/items.json'); //Read only
    // Game Info
    this.gameInfo =
    "--------------------A rogue-like game made by RunEMC--------------------\n"+
    "Explore, fight and gain loot. Use !rg explore [location] to explore a place.\n"+
    "The events of the encounter can be seen with !rg log.\n"+
    "After exploring a location, you will need to rest, the harder the location, the longer it takes\n"+
    "Use !rg stats to see your inventory and allocate your stat points\n"+
    "More features to come! Feel free to help contribute: https://github.com/RunEMC/NootBot \n";
    this.cmdsList =
    "--------------------Commands--------------------\n"+
    " - !rg explore [area]: Explore an area.\n"+
    " - !rg log: Check the explore log.\n"+
    " - !rg help: Info on the game.\n"+
    " - !rg use [item] [amount]: Use item.\n"+
    " - !rg shop [buy/sell] [item] [amount]: Buy/sell items to/from shop.\n"+
    " - !rg inspect [item]: Examine an item.\n"+
    " - !rg stats [allocate] [str/dex/int/fort] [amount]: Check your stats and allocate new stat points.\n";
    this.locationsList =
    "------Explorable Locations (!rg explore [location])------\n" +
    "Grassy Fields (lvl 1) - [grassyfields]\n"+
    "Saffron Hills (lvl 6) - [saffronhills]\n";
  }

  public getReturnMsg():string {
    // console.log(this.returnMsg);
    return this.returnMsg;
  }

  public getExploreLog():string {
    // console.log(this.exploreLog);
    return this.exploreLog;
  }

  public runGame() {
    // Init playerData
    this.playerData = this.players[this.username];
    // Check if player exists in json, if not, make new player character
    if (this.playerData === undefined) {
      this.createNewChar();
    }
    else {
      this.playerRecover(); // Recover some player hp based on time passed
    }
    // Process command
    if (this.cmdArray.length) {
      // Get the other words in the command
      var firstWord = this.cmdArray[0];
      var secondWord = this.cmdArray[1];
      var thirdWord = this.cmdArray[2];
      var fourthWord = this.cmdArray[3];
      // Check cmmds
      if (matchCase(firstWord, "explore")) { // If !rg explore
        if (this.cmdArray.length > 1) {
          // Get the time left from the previous exploration
          var timeLeft = Math.floor((this.playerData.exploreEndTime - Date.now())/millisecondsInSecond);
          if (timeLeft <= 0) { // Allow new exploration only if time is passed
            if (this.playerData.hpCur > 0) { // Allow new exploration only if player hp > 0
              // Set the location once determined
              this.location = this.cmdArray[1].toLowerCase();
              // Check that the location name is valid
              if (this.locations[this.location] === undefined) {
                this.returnMsg += this.locationsList;
              }
              else { // Location name is valid
                // Init fields
                this.exploreLog = "```";
                this.locationData = this.locations[this.location];
                this.mobs = this.locationData.mobs;
                this.items = this.locationData.items;
                // Begin exploring the location
                this.exploreLog += "--------------------"+this.locationData.displayName+"--------------------\n"
                this.explore();
                // Finish explorelog block
                this.exploreLog += "```";
              }
            }
            else {
              this.returnMsg += "You can't explore at 0 hp!\nTry again when your health has recovered";
            }
          }
          else {
            this.returnMsg +=
            "Resting, time remaining: "+timeLeft+" seconds\n";
          }
        }
        else { // If no area chosen
          this.returnMsg += this.locationsList;
        }
      }
      else if (matchCase(firstWord, "log")) { // If !rg log
        return "sendLog";
      }
      else if (matchCase(firstWord, "help")) { // If !rg help
        this.returnMsg += this.gameInfo + this.cmdsList;
      }
      else if (matchCase(firstWord, "stats")) { // If !rg stats
        if (this.cmdArray.length > 1) {
          if (matchCase(this.cmdArray[1], "allocate")) { // Assign skillpoints
            if (this.cmdArray.length > 2) { // If !rg stats allocate
              if (["str", "dex", "int", "fort"].indexOf(this.cmdArray[2]) !== -1) {
                if (this.cmdArray.length > 3) {
                  var amnt = parseInt(this.cmdArray[3])
                  if (amnt > 0 && amnt <= this.playerData.statpts) {
                    this.playerData[this.cmdArray[2]]+=amnt;
                    this.playerData.statpts-=amnt;
                    // Increase atk/def/hp/etc. based on stat points
                    this.updatePlayerStats();
                    this.getPlayerStats();
                  }
                  else if (amnt > this.playerData.statpts) {
                    this.returnMsg += "You do not have that many points to use!\n";
                  }
                  else {
                    this.returnMsg += "Invalid number, example usage: !rg stats allocate str 2\n";
                  }
                }
                else {
                  this.returnMsg += "Please enter the amount to allocate, example usage: !rg stats allocate str 2\n";
                }
              }
              else {
                this.returnMsg += "Invalid stat, example usage: !rg stats allocate str 2\n";
              }
            }
            else { // nothing after !rg stats allocate
              this.returnMsg += "Please enter a stat and the amount, example usage: !rg stats allocate str 2\n";
            }
          }
          else {
            this.returnMsg += "Invalid command, usage: !rg stats [allocate] [str/dex/int/fort] [amount]\n";
          }
        }
        else {
          // Update returnMsg with the player's stats
          this.getPlayerStats();
        }
      }
      else if (matchCase(firstWord, "use")) {// if !rg use
        var useAmt = parseInt(thirdWord);
        if (secondWord !== undefined && thirdWord !== undefined && useAmt > 0) {
          this.useItem(secondWord, useAmt);
        }
        else if (secondWord === undefined) {
          this.returnMsg+="Please input an item to use.\n";
        }
        else if (thirdWord === undefined) {
          this.returnMsg+="Please input an amount to use.\n";
        }
        else {
          this.returnMsg+="Please input the amount as a positive integer.\n";
        }
      }
      else if (matchCase(firstWord, "shop")) {// if !rg shop
        if (secondWord === undefined) {
          this.viewShop();
        }
        else if (thirdWord === undefined || this.items[thirdWord] === undefined) {
          this.returnMsg += "Invalid item\n";
        }
        else if (fourthWord === undefined || parseInt(fourthWord) <= 0) {
          this.returnMsg += "Invalid amount, needs to be positive integer\n";
        }
        else if (matchCase(firstWord, "buy")) {
          var playerCoins = this.playerData.coins;
          var pos = findObjInArray(itemName, "name", this.shopData.curCommon);
          if (pos >= 0) {
          }
          else {

          }
        }
        else if (matchCase(firstWord, "sell")) {

        }
        else {
          this.returnMsg += "Invalid shop usage\n";
        }
      }
      else {
        this.returnMsg += "Invalid command\n"+this.cmdsList;
      }
    }
    else { // Handles no parameters (just !rg)
      this.returnMsg += this.cmdsList;
    }

    // Write to file
    this.players[this.username] = this.playerData;
    jsonfile.writeFile(this.playersFile, this.players, function (err) {
      if (err) console.error("Write error: " + err);
    });
    jsonfile.writeFile(this.shopFile, this.shopData, function (err) {
      if (err) console.error("Write error: " + err);
    });
    // Append return messages
    this.returnMsg += "```";
    return "sendMessage";
  }

  private explore() {
    // Set exploration start time
    var startTime = this.playerData.exploreStartTime = Date.now();
    this.playerData.exploreEndTime = startTime + (millisecondsInSecond * this.locationData.time);

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

      this.spawnItems(this.locationData.itemSpawnChance);
    }

    // Create flavor text
    this.returnMsg += "\nWhile exploring " + this.locationData.displayName + " you defeated:\n"
    for (var i = 0; i < this.locationData.mobs.length; i++) {
      var mob = this.locationData.mobs[i]
      if (this.mobEncounters[mob]) this.returnMsg += " - "+this.mobsData[mob].displayName+": "+this.mobEncounters[mob]+"\n";
    }

    this.returnMsg += "\nYou acquired:\n"
    for (var i = 0; i < this.locationData.items.length; i++) {
      var item = this.locationData.items[i]
      if (this.itemEncounters[item]) this.returnMsg += " - " + this.itemsData[item].displayName + ": " + this.itemEncounters[item] + "\n";
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

  private spawnItems(spawnchance) {
    for (var item in spawnchance) {
      var randNum = Math.random();

      if (spawnchance[item] >= randNum) {
        // this.itemEncounters[item] === undefined ? this.itemEncounters[item] = 1 : this.itemEncounters[item]++;
        // Add the acquired items to the player's inventory
        this.addItemsToInv(item, 1);
      }
    }
  }

  private addItemsToInv(item, amt) {
    this.playerData.inventory[item] === undefined ? this.playerData.inventory[item] = amt : this.playerData.inventory[item]+=amt;
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
            // Gain experience
            this.playerData.expCur += mobStats.xpGain;
            // Add algorithms for determining xp required for next lvl and pts gain per lvl
            if (this.playerData.expCur >= this.playerData.expNext) {
              // Increase player level and reset current exp
              this.playerData.level++;
              this.playerData.expCur -= this.playerData.expNext;
              // Gain 1 stats points each level, 3 every 5 levels and 5 every 10 levels
              if (this.playerData.level % 10 === 0) {
                this.playerData.statpts+=5;
              }
              else if (this.playerData.level % 5 === 0) {
                this.playerData.statpts+=3;
              }
              else {
                this.playerData.statpts++;
              }
              // Increase exp needed for next level by 5% per level
              this.playerData.expNext = this.baseXpNeeded * (1 + (0.05 * (this.playerData.level - 1)))
              this.exploreLog +=
              "\nYou leveled up!\n"+
              "You have "+this.playerData.statpts+" stat point(s) available.\n";
            }
            // Gain Items & Coins
            this.playerData.coins += mobStats.coinGain;
            this.spawnItems(mobStats.dropChance);
            // Stop fighting mob (this will mean mobs that are 1 shot won't deal dmg to player)
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
    "HP Recovery: "+stats.hpRec+"/"+stats.hpRecTime+"sec\tMP Recovery: "+stats.mpRec+"/"+stats.mpRecTime+"sec\n"+
    "Atk: "+stats.atk+"\tDef: "+stats.def+"\n"+
    "Strength: "+stats.str+"\tDexterity: "+stats.dex+"\n"+
    "Intelligence: "+stats.int+"\tFortitude: "+stats.fort+"\n"+
    "Stat Points Available: "+stats.statpts+"\n"+
    "Coins: "+stats.coins+"\n"+
    "\n--------------------"+this.username+"\'s Inventory--------------------\n";
    for (var item in stats.inventory) {
      this.returnMsg += "- "+this.itemsData[item].displayName+" x"+this.playerData.inventory[item]+": ["+this.itemsData[item].name+"]\n";
    }
  }

  private playerRecover() {
    // Make sure player is missing health
    if (this.playerData.hpCur < this.playerData.hpMax) {
      var timePassed = Date.now() - (this.playerData.lastRecoveryTime + this.playerData.hpRecTime * millisecondsInSecond);
      if (timePassed >= 0) {
        var hpMuliplier = Math.floor((timePassed/millisecondsInSecond)/this.playerData.hpRecTime) + 1;
        var recovery = this.playerData.hpCur+(this.playerData.hpRec*hpMuliplier);
        this.playerData.hpCur = Math.min(this.playerData.hpMax, recovery);
        // Update recoverytime
        var leftOverTime = timePassed-(this.playerData.hpRecTime*(hpMuliplier-1)*millisecondsInSecond);
        this.playerData.lastRecoveryTime = Date.now() - leftOverTime;
      }
    }
    // Do the same thing for mp
  }

  private createNewChar() {
    var playerStats = {
      "name": this.username,
      "level":1,
      "expCur":0,
      "expNext":this.baseXpNeeded,
      "hpCur":this.baseHp,
      "hpMax":this.baseHp,
      "hpRec":this.baseHpRec,
      "hpRecTime":this.baseHpRecTime,
      "mpCur":this.baseMp,
      "mpMax":this.baseMp,
      "mpRec":0,
      "mpRecTime":0,
      "atk":this.baseAtk,
      "def":this.baseDef,
      "str":0,
      "dex":0,
      "int":0,
      "fort":0,
      "statpts":5,
      "coins":0,
      "inventory":{},
      "exploreEndTime":Date.now(),
      "exploreStartTime":Date.now(),
      "lastRecoveryTime":Date.now()
    }
    this.playerData = playerStats;
  }

  private updatePlayerStats() {
    // Increase max hp by 1 for every point in fort, and 1 extra for every 5 points in fort and  10 points in str
    this.playerData.hpMax = this.baseHp + this.playerData.fort + Math.floor(this.playerData.fort / 5) + Math.floor(this.playerData.str / 10);
    // Increase hpRec by 1 for every 5 points in fort and 1 extra for every 10 points
    this.playerData.hpRec = this.baseHpRec + Math.floor(this.playerData.fort / 5) + Math.floor(this.playerData.fort / 10);
    // Reduce rec time by 10% for every 5 poins in dex and every 10 points in int up to 5 second, increases by 5% for every 1 point over base hprec
    this.playerData.hpRecTime = Math.round(this.baseHpRecTime *
    (1 - (Math.floor(this.playerData.dex / 5) * 0.1) - (Math.floor(this.playerData.int / 10) * 0.1) + ((this.playerData.hpRec - this.baseHpRec) * 0.05)));
    console.log((Math.floor(this.playerData.dex / 5) * 0.1),(Math.floor(this.playerData.int / 10) * 0.1),((this.playerData.hpRec - this.baseHpRec) * 0.05));
    // Add logic for mp:

    // Increase attack by 10% for each point in strength
    this.playerData.atk = Math.round(this.baseAtk * ((this.playerData.str * 0.1) + 1));
    // Increase defence by 10% for each point in fortitude
    this.playerData.def = Math.round(this.baseDef * ((this.playerData.fort * 0.1) + 1));
  }

  private useItem(itemName, useAmt) {
    var itemData = this.itemsData[itemName];
    var itemAmt = this.playerData.inventory[itemName];

    // Perform some basic checks to make sure item is usable
    if (itemData === undefined) {
      this.returnMsg += "Invalid item.\n";
    }
    else if (itemAmt === undefined) {
      this.returnMsg += "You do not have any of this item in your inventory.\n";
    }
    else if (itemData.type !== "consumable") {
      this.returnMsg += "You can not use this item.\n";
    }
    else if (itemAmt >= useAmt) {
      this.returnMsg += "You do not have enough of this item in your inventory.\n";
    }
    else {
      console.log(this.playerData.inventory[itemName]);
      // Remove from inventory
      itemAmt -= useAmt;
      if (itemAmt <= 0) {
        delete this.playerData.inventory[itemName];
      }
      else {
        this.playerData.inventory[itemName] = itemAmt;
      }
      // Check and use effect
      if (itemData.effect === "hpGain") {
        var restoreAmt = itemData.hpGain * useAmt;
        this.playerData.hpCur = Math.min(this.playerData.hpCur + restoreAmt, this.playerData.hpMax);
        this.returnMsg+="Healed for "+restoreAmt+"HP\n";
      }
      else {
        this.returnMsg+="This item has no effect.\n";
      }
      console.log(this.playerData.inventory[itemName]);
    }
  }

  private viewShop() {
    // Restock shop with new items if necessary
    var refreshRate = this.shopSettings.shopRefreshTime;
    if (this.shopData.nextUpdate <= Date.now()) {
      this.shopData.nextUpdate = Date.now() + (refreshRate * millisecondsInSecond) - ((Date.now() - this.shopData.nextUpdate) % (refreshRate * millisecondsInSecond));
      this.refreshShop();
    }
    this.returnMsg+="Shop Changes In: "+Math.floor((this.shopData.nextUpdate-Date.now())/millisecondsInSecond)+" seconds\n";
    this.returnMsg += "--------------------Shop Items--------------------\n";
    for (var itemName in this.shopData.stock) {
      var item = this.shopData.stock[itemName];
      this.returnMsg += item.displayName+": "+item.price+" coins ["+item.name+"]\n";
    }
  }

  private refreshShop() {
    for (var rarity in this.shopSettings.rarities) {
      var itemsList = this.shopSettings[rarity];
      for (var i = 0; i < this.shopSettings.rarities[rarity]; i++) {
        var randItemPos = Math.floor(Math.random() * (itemsList.length - 1));
        var randItemName = itemsList[randItemPos];
        var shopItem = this.itemsData[randItemName];
        this.shopData.stock.push(shopItem);
        // Delete item from list to prevent duplicate
        itemsList.splice(randItemPos, 1);
      }
    }
  }

  private buyItems(itemName, amt) {
    var itemPos = findObjInArray(itemName, "name", this.shopData.stock);
    if (itemPos < 0) {
      this.returnMsg += "Item not available in shop.\n";
    }
    else {
      var item = this.shopData.stock[itemPos];
      var price = item.price;
      var cost = price * amt;
      var playerCoins = this.playerData.coins;
      if (playerCoins < cost) {
        this.returnMsg+="You can't afford that! (Coins: "+playerCoins+", Cost: "+cost+")";
      }
      else {
        this.playerData.coins -= cost;
        this.addItemsToInv(itemName, amt);
      }
    }
  }
}

// Check if an object with specific field is in an array
function findObjInArray(val, field, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][field] === val) {
      return i;
    }
  }
  return -1;
}

// Checks if two strings are equal regardless of case
function matchCase(str1, str2) {
  return str1.toUpperCase() === str2.toUpperCase();
}
