"use strict";
exports.__esModule = true;
var jsonfile = require("jsonfile");
var GooseGame = /** @class */ (function () {
    function GooseGame(cmdArray, author) {
        this.cmdArray = cmdArray;
        this.author = author;
        // Init player info
        this.playersFile = 'ggData/players.json';
        this.players = jsonfile.readFileSync(this.playersFile);
        this.playerData = this.players[author.username];
        if (this.playerData === undefined)
            this.createNewPlayer();
        // Init geese info
        this.geeseData = jsonfile.readFileSync('ggData/geese.json');
        // Init game info
        this.returnMsg = "```\n";
        this.gameInfo =
            "--------------------Goose Game by RunEMC--------------------\n" +
                "Collect geese by buying basic ones from the shop.\n" +
                "Breed geese to get better and rarer geese.\n" +
                "Steal geese from other players, but if it fails you will lose coins.\n" +
                "Geese will drop materials and coins for upgrades and breeding.\n" +
                "Sell geese for materials and coins.\n" +
                "See commands list below for the commands you can use.\n" +
                "(More features to come! Feel free to help contribute: https://github.com/RunEMC/NootBot) \n";
        this.cmdsList =
            "--------------------Commands--------------------\n" +
                " - !gg help: Info on the game.\n" +
                " - !gg nest: Check your geese collection.\n" +
                " - !gg breed: Check breeding progress.\n" +
                " - !gg breed [goose] [goose]: Breed two geese.\n" +
                " - !gg eggs: Check hatching progress.\n" +
                " - !gg upgrade: Check upgrades available.\n" +
                " - !gg shop: Check the geese available for purchase.\n" +
                " - !gg buy [goose]: Purchase a goose.\n";
    }
    GooseGame.prototype.getReturnMsg = function () {
        // console.log(this.returnMsg);
        this.returnMsg += "```\n";
        return this.returnMsg;
    };
    GooseGame.prototype.processCommand = function () {
        var firstWord = this.cmdArray[0];
        var firstWord = this.cmdArray[1];
        var firstWord = this.cmdArray[2];
        var firstWord = this.cmdArray[3];
        // Error check
        if (firstWord === undefined || firstWord === "help") {
            this.returnMsg += this.gameInfo + this.cmdsList;
        }
        else if (firstWord === "nest") {
            this.getPlayerNest();
        }
        // Write to file
        this.players[this.author.username] = this.playerData;
        jsonfile.writeFile(this.playersFile, this.players, function (err) {
            if (err)
                console.error("Write error: " + err);
        });
    };
    GooseGame.prototype.createNewPlayer = function () {
        var nextID = this.players._nextID;
        var goose = {
            "name": "Basic Goose",
            "id": nextID.toString(),
            "level": 1,
            "type": "basic",
            "coins": 1,
            "coinGenTime": 15
        };
        this.playerData = {
            "name": this.author.username,
            "id": this.author.id.toString(),
            "coins": 0,
            "nextStealTime": 0,
            "nestMax": 10,
            "breedMax": 2,
            "eggsMax": 3,
            "nest": {},
            "breeding": {},
            "eggs": {},
            "materials": {}
        };
        this.playerData.nest[nextID] = goose;
        this.players[this.author.username] = this.playerData;
    };
    GooseGame.prototype.getPlayerNest = function () {
        var info = this.playerData;
        this.returnMsg +=
            "\n--------------------" + info.name + "\'s Nest--------------------\n";
        var geeseMsg = "";
        for (var gooseID in info.nest) {
            var goose = info.nest[gooseID];
            geeseMsg += goose.name + " (Lvl " + goose.level + "): $" + goose.coins + "/" + goose.coinGenTime + "sec\n";
        }
    };
    return GooseGame;
}());
exports.GooseGame = GooseGame;
