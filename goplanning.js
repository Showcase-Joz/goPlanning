/*
  
*/

// requires
const path = require("path");
const os = require("os");
const yargs = require("yargs");

const files = require("./methods/utils/fileData");
const helpers = require("./methods/utils/helpers");
const start = require("./go-start");
const restart = require("./go-restart");

const appDir = path.resolve("./");
const settingsPath = path.join(appDir, "settings");
const councilsPath = path.join(settingsPath, "council-planning.json");


yargs.version("2.7.2");
yargs
  .usage(`
Usage:
  -> $0 start [council] [startLetter] [finishLetter] [reset] [typhon]
  -? $0 start tips
  OR
  -> $0 restart [council] [false]
  -? $0 restart tips`)
  // .showHelp()
  .showHelpOnFail(true, "Try these tips")
  .strict()
  .command({
    command: "$0 start [council]* [startLetter] [finishLetter] [reset] [typhon]",
    describe: "Adding all the positional arguments will allow the process to run optimally, alternatively just add the required(*)",
    builder: yargs => {
      yargs
        .fail(function (msg, err, yargs) {
          if (err) throw err // preserve stack
          console.error("That's not the best way to start a process...")
          console.error(msg)
          console.error('You should be doing ->', yargs.help())
          process.exit(1)
        })
        .option("council", {
          alias: "c",
          describe: "Council name (or index number) to find URL and start the process with"
        })
        .positional("council", {
          demandOption: true,
          type: "string",
        })
        .option("startLetter", {
          alias: "s",
          describe: "What letter will you start the process on",
          default: "A",
        })
        .positional("startLetter", {
          demandOption: true,
          type: "string",
        })
        .option("finishLetter", {
          alias: "f",
          describe: "What letter will you finish the process on",
          default: "Z"
        })
        .positional("finishLetter", {
          demandOption: true,
          type: "string",
        })
        .option("reset", {
          alias: "r",
          describe: "Clear all partial data from a previous attempt",
          default: false
        })
        .positional("reset", {
          demandOption: true,
          type: "boolean",
        })
        .option("typhon", {
          alias: "t",
          describe: "Remote logging will automatically occur for this process",
          default: true
        })
        .positional("typhon", {
          demandOption: true,
          type: "boolean",
        })
        .demandOption("council")
        .example("$0 start [number or name]* [letter]* [letter after previous letter]* [boolean] [boolean]")
        .example("$0 start -council='Basingstoke & Deane' -startLetter=j -finishLetter=s")
        .example("$0 start -c=04 -s=f -f=j -r=true -t=false")
        .help("tips")
        .epilogue(`------------------------------------------------
goplanning - Council planning portal scraper app
        
Visit https://typhon.sst-l.com/ to check the logs for this process.
They are stored under NS:goplanning, N:[example.borough].logs
`)
    },
    handler: async function (argv) {
      // console.clear();
      let options = files.readConfig();

      // create variables
      let councilURL = "";
      const byName = /([A-Za-z &,'.-])+/g;
      const byNumber = /([0-9])+/g;
      const typhonReplacer = /[0-9.\s'-,]/g;

      // clone options data, get fileLocation.outputFolder newOutputFolder
      const updateOptions = options;
      const newOutputFolder = updateOptions.fileLocations;
      const newResetState = updateOptions.resetOnStart;
      const newTyphonState = updateOptions.logs;

      // read from the councils object list
      const councilList = files.readFromTemp(councilsPath);

      // create alphabet array and get start/finishLetter placements
      const textAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const alphabetArray = textAlphabet.split("");
      const startLocation = helpers.findLetterIndex(argv.startLetter.toUpperCase(), alphabetArray);
      const finishLocation = helpers.findLetterIndex(argv.finishLetter.toUpperCase(), alphabetArray);

      // handle cases for council
      if (argv.council.match(byName)) {
        // if there is user input (council by name), send feedback and check councils data file for name
        // console.clear();
        console.log("Looking for " + argv.council.toUpperCase() + " council");

        // search council objects for the yargs council --council="This Council"
        const possibleCouncilMatch = new Array;
        for (const item in councilList) {
          if (councilList.hasOwnProperty(item)) {
            const element = councilList[item].council.includes(argv.council);
            if (element) {
              possibleCouncilMatch.push(`${councilList[item].council} || ${councilList[item].id === 0 ? councilList[item].id : "0"+councilList[item].id}`);
            }
          }
        }
        console.log(`Possible council's you were looking for...
Type {this} or ID {that} after 'goplanning start [here]'
`);
        possibleCouncilMatch.forEach(possibleCouncilMatchItem => {
          console.log(possibleCouncilMatchItem);
        });
        

        const foundCouncil = councilList.map((o) => o.council).indexOf(argv.council);
        console.log(foundCouncila, 34343);
        if (foundCouncil > -1) {
          // if there is a council with that name, update the config file and get the url string for that council
          newOutputFolder.outputFolder = councilList[foundCouncil].shortName === undefined ? councilList[foundCouncil].council.replace(typhonReplacer, ".").toLowerCase() : councilList[foundCouncil].shortName;
          files.writeConfig(updateOptions);
          options = files.readConfig();

          councilURL = councilList[foundCouncil].url;
          console.log(`${councilList[foundCouncil].council} has been matched and that URL will now be used.
          
          `);
          return;
        } else {
          // set defaults back to blank
          newOutputFolder.outputFolder = "";
          files.writeConfig(updateOptions);
          options = files.readConfig();

          // tell the user why it didn't work
          console.log(`Couldn't find a council with that (exact) name.
  You can find a list of council objects here (${councilsPath}), if you need to correct your type error.`);
          const fullCouncilList = councilList.map((o) => o.council);
          console.log(fullCouncilList, 45455);
          return;
        }

      } else if (argv.council.match(byNumber)) {
        // if there is user input (council by number), send feedback and check councils data file for index
        // console.clear();
        console.log(`Trying to match the number (${argv.council}) to a council's index...`);

        // search council object for the yargs council --council="278" (based on object index number)
        const foundCouncil = councilList.map((o) => o.id).indexOf(parseInt(argv.council));
        if (argv.council < councilList.length) {
          // if there is a council with that number, update the config file with the council name and get the url string for that council
          newOutputFolder.outputFolder = councilList[foundCouncil].shortName === undefined ? councilList[foundCouncil].council.replace(typhonReplacer, ".").toLowerCase() : councilList[foundCouncil].shortName;
          files.writeConfig(updateOptions);
          options = files.readConfig();

          councilURL = councilList[foundCouncil].url;
          console.log(`${councilList[foundCouncil].council} has been matched and that URL will now be used.
          
          `);
        } else {
          // set defaults back to blank
          newOutputFolder.outputFolder = "";
          files.writeConfig(updateOptions);
          options = files.readConfig();

          console.log(`There are only (${councilList.length}) council objects on file.
  Therefore (${argv.council}) is to high! Try a number below (${councilList.length}) or consider it time for a tea break :)`);
          return;
        }
      }

      // handle letters order
      if (startLocation > finishLocation) {
        console.log(`Did you not attend school? You can't have a startLetter (${argv.startLetter}) that comes after a finishLetter (${argv.finishLetter}).
  It's not alphabetically correct, please swap the order and try again!!`);
      }

      // handle reset state
      if (argv.reset !== newResetState) {
        updateOptions.resetOnStart = argv.reset;
        files.writeConfig(updateOptions);
      }

      // handle typhon log state
      if (argv.typhon !== newTyphonState.typhon) {
        newTyphonState.typhon = argv.typhon;
        files.writeConfig(updateOptions);
      };
      start(`${councilURL}${argv.startLetter}`, `${argv.finishLetter}`);
    }
  })
  .command({
    command: "restart [council] [typhon]",
    describe: "Used to restart a process that has stopped for some reason",
    builder: yargs => {
      yargs
        .fail(function (msg, err, yargs) {
          if (err) throw err // preserve stack
          console.error("That's not the best way to restart a process...")
          console.error(msg)
          console.error('You should be doing ->', yargs.help())
          process.exit(1)
        })
        .option("council", {
          alias: "c",
          describe: "Council name (or index number) to find URL and start the process with"
        })
        .positional("council", {
          demandOption: true,
          type: "string",
        })
        .option("typhon", {
          alias: "t",
          describe: "Remote logging will automatically occur for this process unless its set to FALSE"
        })
        .positional("typhon", {
          demandOption: true,
          type: "boolean",
          default: true
        })
        .demandOption("council")
        .example("$0 restart [council]*")
        .example("$0 restart [council]* [false]")
        .example("$0 start -c='Basingstoke & Deane' -t=true")
        .example("$0 start -c=04 -t=false")
        .help("tips")
    },
    handler: async function (argv) {
      // console.clear();
      let options = files.readConfig();

      // create variables
      let councilURL = "";
      const byName = /([A-Za-z &,'.-])+/g;
      const byNumber = /([0-9])+/g;

      // clone options data, get fileLocation.outputFolder newOutputFolder
      const updateOptions = options;
      const newOutputFolder = updateOptions.fileLocations;
      const newTyphonState = updateOptions.logs;
      
      // read from the councils object list
      const councilList = files.readFromTemp(councilsPath);

      // handle cases for council
      if (argv.council.match(byName)) {
        // if there is user input (council by name), send feedback and check councils data file for name
        // console.clear();
        console.log("Looking for " + argv.council.toUpperCase() + " council");

        // search council objects for the yargs council --council="This Council"
        const possibleCouncilMatch = new Array;
        for (const item in councilList) {
          if (councilList.hasOwnProperty(item)) {
            const element = councilList[item].council.includes(argv.council);
            if (element) {
              possibleCouncilMatch.push(`${councilList[item].council} || ${councilList[item].id === 0 ? councilList[item].id : "0"+councilList[item].id}`);
            }
          }
        }
        console.log(`Possible council's you were looking for...
Type {this} or ID {that} after 'goplanning start [here]'
`);
        possibleCouncilMatch.forEach(possibleCouncilMatchItem => {
          console.log(possibleCouncilMatchItem);
        });
        

        const foundCouncil = councilList.map((o) => o.council).indexOf(argv.council);
        console.log(foundCouncila, 34343);
        if (foundCouncil > -1) {
          // if there is a council with that name, update the config file and get the url string for that council
          newOutputFolder.outputFolder = councilList[foundCouncil].shortName === undefined ? councilList[foundCouncil].council.replace(typhonReplacer, ".").toLowerCase() : councilList[foundCouncil].shortName;
          files.writeConfig(updateOptions);
          options = files.readConfig();

          councilURL = councilList[foundCouncil].url;
          console.log(`${councilList[foundCouncil].council} has been matched and that URL will now be used.
          
          `);
          return;
        } else {
          // set defaults back to blank
          newOutputFolder.outputFolder = "";
          files.writeConfig(updateOptions);
          options = files.readConfig();

          // tell the user why it didn't work
          console.log(`Couldn't find a council with that (exact) name.
  You can find a list of council objects here (${councilsPath}), if you need to correct your type error.`);
          const fullCouncilList = councilList.map((o) => o.council);
          console.log(fullCouncilList, 45455);
          return;
        }

      } else if (argv.council.match(byNumber)) {
        // if there is user input (council by number), send feedback and check councils data file for index
        // console.clear();
        console.log(`Trying to match the number (${argv.council}) to a council's index...`);

        // search council object for the yargs council --council="278" (based on object index number)
        const foundCouncil = councilList.map((o) => o.id).indexOf(parseInt(argv.council));
        if (argv.council < councilList.length) {
          // if there is a council with that number, update the config file with the council name and get the url string for that council
          newOutputFolder.outputFolder = councilList[foundCouncil].shortName === undefined ? councilList[foundCouncil].council.replace(typhonReplacer, ".").toLowerCase() : councilList[foundCouncil].shortName;
          files.writeConfig(updateOptions);
          options = files.readConfig();

          councilURL = councilList[foundCouncil].url;
          console.log(`${councilList[foundCouncil].council} has been matched and that URL will now be used.
          
          `);
        } else {
          // set defaults back to blank
          newOutputFolder.outputFolder = "";
          files.writeConfig(updateOptions);
          options = files.readConfig();

          console.log(`There are only (${councilList.length}) council objects on file.
  Therefore (${argv.council}) is to high! Try a number below (${councilList.length}) or consider it time for a tea break :)`);
          return;
        }
      }

      // handle typhon log state
      if (argv.typhon !== newTyphonState.typhon) {
        newTyphonState.typhon = argv.typhon;
        files.writeConfig(updateOptions);
      };
      restart();
    }
  })
  .demandCommand(1, 'Please specify one command, either "start" or "restart"!')
  .help("help");
yargs.parse();