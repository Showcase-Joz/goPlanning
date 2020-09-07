/*
  Main program file, everything runs in steps, so the functions are wrapped in a wrapper function (planningApps).

*/

// requires
const findLastEntry = require("./methods/handleLog/findLastSuccess");
const cloneAndReduce = require("./methods/handleLog/cloneAndReduce");
const restartStreets = require("./methods/handleLog/restartStreets");
const restartProperties = require("./methods/handleLog/restartProperties");
const goplanning = require("./goplanning");
const files = require("./methods/utils/fileData");
const helpers = require("./methods/utils/helpers");
const options = files.readConfig;

// tidy up folder/console
console.clear();
// convert this into a "buildBase" function that resets and defines structure blaa
files.sysLogs("Attempting to restart processes via 'go-restart'...", "info");

async function restart() {
  // console.log(initialUrl, 222, endLetter,333);
  // // write any unhandledRejection errors to log
  // process.on('unhandledRejection', error => {
  //   files.sysLogs("Check details for further reference", "warning", `${error.toString()}`);
  //   throw error;
  // });

  // console.log("RESTART");

  // get last successful save entry from logs, determine if process can be restarted
  const usableEntry = await findLastEntry();
  if (usableEntry) {
    // if the process did get started workout where it got to
    // create reduced array
    const reducedArray = await cloneAndReduce(helpers.flatten(usableEntry));

    if (reducedArray[2] === "properties") {
      // if the process got to the properties - step (3)
      // remove 'temp' file if exists
      const exists = files.fileExist(reducedArray[1]);
      if (exists) files.removeFile(reducedArray[1]);

      // LOG
      files.sysLogs("is array <- restarting via 'properties' method", "debug");

      // add brackets to array item
      const addingBrackets = JSON.stringify(reducedArray[0]);
      const updatedArray = JSON.parse("[" + addingBrackets + "]");
      // restart streets part way through 'workingStreetsFile'
      restartStreets(updatedArray, reducedArray[1]);

      // RETURN
      return;
    } else if (reducedArray[2] === "property") {
      // if the process got to the property - step (4)
      // remove 'temp' file if exists
      const exists = files.fileExist(reducedArray[1]);
      if (exists) files.removeFile(reducedArray[1]);

      // LOG
      files.sysLogs("is object <- restarting via 'property' method", "debug");
      // restart properties part way through 'propertyFile'
      restartProperties(reducedArray[0], reducedArray[1], reducedArray[2]);

      // RETURN
      return;
    } else {
      if (error) throw error 
      // if the process didn't get very far step (1) or step (2)...start over
      console.log("Something happened, or didn't and it's not been accoounted for yet!");
      // LOG
      files.sysLogs("Something didn't happen and it's not been accoounted for. Check error log!!", "debug", `${error.toString()}`);

      // RETURN
      return;
    }
  } else if (usableEntry === null) {
    // if the process finished, return null to prove it
    console.log("THIS PROCESS HAS ALREADY COMPLETED SUCCESSFULLY!!");
    // LOG
    files.sysLogs("THIS PROCESS HAS ALREADY COMPLETED SUCCESSFULLY!!", "warning");

    // RETURN
    return;
  } else if (usableEntry === undefined) {
    // if the process didn't get very far step (1) or step (2)...start over
    console.log("This process didn't get as far as step (3) or step (4). You can 'start' the process again....it'll take a few hours to get a full index ready for step (3), which just saves more blot in the app!!");
    // LOG
    files.sysLogs("Tried to restart a process that didn't get to step (3)", "warning");
    // delay a fresh start que by running goplanning without any params
    setTimeout(() => {
      goplanning();
    }, options.console.logTimeout);

    // RETURN
    return;
  }

  // RETURN
  return;
}
module.exports = restart;