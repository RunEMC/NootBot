"use strict";
exports.__esModule = true;
var RogueGamet = /** @class */ (function () {
    function RogueGamet(cmdArray, username) {
        this.cmdArray = cmdArray;
        this.username = username;
    }
    RogueGamet.prototype.processCommand = function () {
        console.log(this.cmdArray, this.username, "test");
    };
    return RogueGamet;
}());
exports.RogueGamet = RogueGamet;
