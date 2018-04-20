"use strict";
exports.__esModule = true;
var jsonfile = require("jsonfile");
var millisecondsInSecond = 1000;
var RogueGame = /** @class */ (function () {
    function RogueGame(cmdArray, username) {
        // Return Msg
        this.returnMsg = "```";
        this.exploreLog = "```";
        // Players' Data
        this.playersFile = 'roguedata/player_stats.json';
        this.players = jsonfile.readFileSync(this.playersFile); //Read/Write
        this.playerData = this.players[this.username];
        // Locations' Data
        this.locations = jsonfile.readFileSync('roguedata/locations.json'); //Read only
        this.locationData = this.locations.grassyfields; // Tempdata, will get populated
        this.mobs = [];
        this.items = [];
        // Mobs' Data
        this.mobsData = jsonfile.readFileSync('roguedata/mobs.json'); //Read only
        // Items' Data
        this.itemsData = jsonfile.readFileSync('roguedata/items.json'); //Read only
        // Encounter Data
        this.mobEncounters = {};
        this.newMobEncounters = {};
        this.itemEncounters = {};
        this.isPlayerDead = false;
        this.cmdArray = cmdArray;
        this.username = username;
    }
    RogueGame.prototype.getReturnMsg = function () {
        // console.log(this.returnMsg);
        return this.returnMsg;
    };
    RogueGame.prototype.getExploreLog = function () {
        // console.log(this.exploreLog);
        return this.exploreLog;
    };
    RogueGame.prototype.runGame = function () {
        this.playerData = this.players[this.username];
        this.playerRecover(); // Recover some player hp based on time passed
        if (this.cmdArray.length) {
            if (matchCase(this.cmdArray[0], "explore")) {
                if (this.cmdArray.length > 1) {
                    // Get the time left from the previous exploration
                    var timeLeft = Math.floor((this.playerData.exploreEndTime - Date.now()) / millisecondsInSecond);
                    if (timeLeft <= 0) {
                        if (this.playerData.hpCur > 0) {
                            // Set the location once determined
                            this.location = this.cmdArray[1].toLowerCase();
                            // Check that the location name is valid
                            if (this.locations[this.location] === undefined) {
                                this.returnMsg +=
                                    "Invalid location, use example: !rg explore grassyfields\n" +
                                        "------Explorable Locations (!rg explore [location])------\n" +
                                        "Grassy Fields (lvl 1) - [grassyfields]";
                            }
                            else {
                                this.locationData = this.locations[this.location];
                                this.mobs = this.locationData.mobs;
                                this.items = this.locationData.items;
                                // Begin exploring the location
                                this.exploreLog += "--------------------" + this.locationData.displayName + "--------------------\n";
                                this.explore();
                            }
                        }
                        else {
                            this.returnMsg += "You can't explore at 0 hp!\nTry again when your health has recovered";
                        }
                    }
                    else {
                        this.returnMsg +=
                            "Resting, time remaining: " + timeLeft + " seconds\n";
                    }
                }
                else {
                    this.returnMsg += "------Explorable Locations (!rg explore [location])------\n" +
                        "Grassy Fields (lvl 1) - [grassyfields]";
                }
            }
            else if (matchCase(this.cmdArray[0], "log")) {
                return "sendLog";
            }
            else if (matchCase(this.cmdArray[0], "help")) {
                this.returnMsg += "--------------------Commands--------------------\n" +
                    " - !rg explore [area]: Explore an area.\n" +
                    " - !rg help: Info on the game.\n" +
                    " - !rg stats [allocate] [str/dex/int/fort] [amount]: Check your stats and allocate new stat points.";
            }
            else if (matchCase(this.cmdArray[0], "stats")) {
                if (this.cmdArray.length > 1) {
                    if (matchCase(this.cmdArray[1], "allocate")) {
                        if (this.cmdArray.length > 2) {
                            if (this.playerData[this.cmdArray[2]] !== undefined) {
                                if (this.cmdArray.length > 3) {
                                    if (typeof this.cmdArray[3] === "number" && this.cmdArray[3] > 0) {
                                        this.playerData[this.cmdArray[2]] += this.cmdArray[3];
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
                        else {
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
        else {
            this.returnMsg += "--------------------Commands--------------------\n" +
                " - !rg explore [area]: Explore an area.\n" +
                " - !rg help: Info on the game.\n" +
                " - !rg stats [allocate] [str/dex/int/fort] [amount]: Check your stats and allocate new stat points.";
        }
        this.returnMsg += "```";
        this.exploreLog += "```";
        return "sendMessage";
    };
    RogueGame.prototype.explore = function () {
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
            this.exploreLog += "--------------------Stage " + (i + 1) + "--------------------\n";
            this.spawnMobs();
            this.fightMobs();
            if (this.isPlayerDead)
                break;
            this.spawnItems(this.locationData.itemSpawnChance);
        }
        // Write to file
        this.players[this.username] = this.playerData;
        jsonfile.writeFile(this.playersFile, this.players, function (err) {
            if (err)
                console.error("Write error: " + err);
        });
        // Create flavor text
        this.returnMsg += "\nWhile exploring " + this.locationData.displayName + " you defeated:\n";
        for (var i = 0; i < this.locationData.mobs.length; i++) {
            var mob = this.locationData.mobs[i];
            this.returnMsg += " - " + this.mobsData[mob].displayName + ": " + this.mobEncounters[mob] + "\n";
        }
        this.returnMsg += "\nYou acquired:\n";
        for (var i = 0; i < this.locationData.items.length; i++) {
            var item = this.locationData.items[i];
            this.returnMsg += " - " + this.itemsData[item].displayName + ": " + this.itemEncounters[item] + "\n";
        }
    };
    RogueGame.prototype.spawnMobs = function () {
        for (var i = 0; i < this.mobs.length; i++) {
            var mob = this.mobs[i];
            var randNum = Math.random();
            if (this.locationData.mobSpawnChance[mob] >= randNum) {
                this.newMobEncounters[mob] = 1;
            }
        }
    };
    RogueGame.prototype.spawnItems = function (spawnchance) {
        for (var item in spawnchance) {
            var randNum = Math.random();
            if (spawnchance[item] >= randNum) {
                // this.itemEncounters[item] === undefined ? this.itemEncounters[item] = 1 : this.itemEncounters[item]++;
                // Add the acquired items to the player's inventory
                this.playerData.inventory[item] === undefined ? this.playerData.inventory[item] = 1 : this.playerData.inventory[item]++;
            }
        }
    };
    // Simulate a fight between the player and the mobs
    RogueGame.prototype.fightMobs = function () {
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
                            this.playerData.expCur -= this.playerData.expNext;
                            this.playerData.skillpts++;
                            this.playerData.level++;
                            this.exploreLog += "\nYou leveled up!\n";
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
    };
    RogueGame.prototype.getPlayerStats = function () {
        var stats = this.playerData;
        this.returnMsg +=
            "\n--------------------" + this.username + "\'s Stats--------------------\n" +
                "Level: " + stats.level + "\tExp: " + stats.expCur + "/" + stats.expNext + "\n" +
                "HP: " + stats.hpCur + "/" + stats.hpMax + "\tMP: " + stats.mpCur + "/" + stats.mpMax + "\n" +
                "HP Recovery: " + stats.hpRec + "/" + stats.hpRecTime + "sec\tMP Recovery: " + stats.mpRec + "/" + stats.mpRecTime + "sec\n" +
                "Atk: " + stats.atk + "\tDef: " + stats.def + "\n" +
                "Strength: " + stats.str + "\tDexterity: " + stats.dex + "\n" +
                "Intelligence: " + stats.int + "\tFortitude: " + stats.fort + "\n" +
                "Stat Points Available: " + stats.skillpts + "\n" +
                "Coins: " + stats.coins + "\n" +
                "\n--------------------" + this.username + "\'s Inventory--------------------\n";
        for (var item in stats.inventory) {
            this.returnMsg += "- " + this.itemsData[item].displayName + ": " + this.playerData.inventory[item] + " (" + this.itemsData[item].description + ")\n";
        }
    };
    RogueGame.prototype.playerRecover = function () {
        // Make sure player is missing health
        if (this.playerData.hpCur < this.playerData.hpMax) {
            var timePassed = Date.now() - (this.playerData.lastRecoveryTime + this.playerData.hpRecTime * millisecondsInSecond);
            if (timePassed >= 0) {
                var hpMuliplier = Math.floor((timePassed / millisecondsInSecond) / this.playerData.hpRecTime) + 1;
                var recovery = this.playerData.hpCur + (this.playerData.hpRec * hpMuliplier);
                this.playerData.hpCur = Math.min(this.playerData.hpMax, recovery);
                // Update recoverytime
                var leftOverTime = timePassed - (this.playerData.hpRecTime * (hpMuliplier - 1) * millisecondsInSecond);
                this.playerData.lastRecoveryTime = Date.now() - leftOverTime;
                // Write to file
                this.players[this.username] = this.playerData;
                jsonfile.writeFile(this.playersFile, this.players, function (err) {
                    if (err)
                        console.error("Write error: " + err);
                });
            }
        }
        // Do the same thing for mp
    };
    return RogueGame;
}());
exports.RogueGame = RogueGame;
// Checks if two strings are equal regardless of case
function matchCase(str1, str2) {
    return str1.toUpperCase() === str2.toUpperCase();
}
