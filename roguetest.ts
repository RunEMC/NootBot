import jsonfile from 'jsonfile';

export class RogueGamet {
  cmdArray:Array<string>;
  username:string;

  constructor(cmdArray, username) {
    this.cmdArray = cmdArray;
    this.username = username;
  }

  public processCommand() {
    console.log(this.cmdArray, this.username, "test");
  }
}
