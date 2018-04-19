"use strict";
exports.__esModule = true;
var jsonfile = require("jsonfile");
var RogueGame = /** @class */ (function () {
    function RogueGame(cmdArray, username) {
        // Return Msg
        this.returnMsg = "```";
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
        this.mobsData = jsonfile.readFileSync('roguedata/mobs.json');
        // Encounter Data
        this.mobEncounters = {};
        this.newMobEncounters = {};
        this.itemEncounters = {};
        this.isPlayerDead = false;
        this.cmdArray = cmdArray;
        this.username = username;
    }
    RogueGame.prototype.runGame = function () {
        this.playerData = this.players[this.username];
        if (this.cmdArray.length) {
            if (matchCase(this.cmdArray[0], "explore")) {
                if (this.cmdArray.length > 1) {
                    // Set the location once determined
                    this.location = this.cmdArray[1];
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
                        this.returnMsg += "--------------------" + this.locationData.displayName + "--------------------\n";
                        this.explore();
                    }
                }
                else {
                    this.returnMsg += "------Explorable Locations (!rg explore [location])------\n" +
                        "Grassy Fields (lvl 1) - [grassyfields]";
                }
            }
        }
        else {
            this.returnMsg += "--------------------Commands--------------------\n" +
                " - !rg explore [area]: Explore an area.\n" +
                " - !rg stats [allocate]: Check your stats and allocate new stat points.";
        }
        this.returnMsg += "```";
        return this.returnMsg;
    };
    RogueGame.prototype.explore = function () {
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
            this.returnMsg += "--------------------Stage " + (i + 1) + "--------------------\n";
            this.spawnMobs();
            this.fightMobs();
            if (this.isPlayerDead)
                break;
            this.spawnItems();
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
            this.returnMsg += " - " + item + ": " + this.itemEncounters[item] + "\n";
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
    RogueGame.prototype.spawnItems = function () {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            var randNum = Math.random();
            if (this.locationData.itemSpawnChance[item] >= randNum) {
                this.itemEncounters[item] === undefined ? this.itemEncounters[item] = 1 : this.itemEncounters[item]++;
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
                    this.returnMsg += "You attack the " + mobStats.displayName + " for " + this.playerData.atk + " damage (" + Math.max(0, mobHp) + "/" + mobStats.hp + ")\n";
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
                            this.returnMsg += "\nYou leveled up!\n";
                        }
                        break;
                    }
                    // Mob attacks player
                    playerHp -= mobStats.atk + this.playerData.def;
                    this.returnMsg += "The " + mobStats.displayName + " attacks you for " + mobStats.atk + " damage (" + Math.max(0, playerHp) + "/" + this.playerData.hpMax + ")\n";
                    // Check if player is dead
                    if (playerHp <= 0) {
                        this.playerData.hpCur = 0;
                        this.isPlayerDead = true;
                        this.returnMsg += "\nYou died!\n";
                        break;
                    }
                }
            }
        }
    };
    return RogueGame;
}());
exports.RogueGame = RogueGame;
// Checks if two strings are equal regardless of case
function matchCase(str1, str2) {
    return str1.toUpperCase() === str2.toUpperCase();
}
