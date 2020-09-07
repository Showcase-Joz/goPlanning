/*
  Main program file, everything runs in steps, so the functions are wrapped in a wrapper function (planningApps).

*/

// requires
const checkLetters = require("./methods/checkAlphabet/checkLetters");
const prepStreetUrls = require("./methods/gatherStreets/prepStreetUrls");
const gatherStreetUrls = require("./methods/processStreetUrls/gatherStreetUrls");
const gatherPropertyObjects = require("./methods/processStreetUrls/processStreets");
const gatherPropertyUrls = require("./methods/processProperties/gatherPropertyUrls");
const files = require("./methods/utils/fileData");
const options = files.readConfig();

async function start(initialUrl, endLetter) {
  // write any unhandledRejection errors to log
  process.on('unhandledRejection', error => {
    files.sysLogs("Check details for further reference", "warning", `${error.toString()}`);
    if (error) {
      console.log(`
      
You broke it!!!
The stack has been sent to Typhon.
But for the sake of giving you something to work with, try this errorMsg: ${error}

`);
    }
  });
  // console.log("START", process.argv[1]);

  // if (process.mainModule.children[1].id.includes("go-start")) {
  //   console.log("YUP");
  // }


  // tidy up folder/console
  // console.clear();
  // convert this into a "buildBase" function that resets and defines structure blaa
  files.folderExist();

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Get delta and Health checks ++++++ START
    Checks the delta between the start and end letters.
    Runs a health check on the letters url to check validity.
    Gives user feedback on delta and bad urls.
    Returns an array of usable urls (in the [lettersFile] file) for processing.
  */
  await checkLetters(initialUrl, endLetter);
  // ------ Get delta and Health checks ------ END
  console.log("Now done with alphabet!!!!");

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Appends and process ++++++ START
    Open and read from accepted-letters.
    Appends to the accepted-letters URL.
    Sends to child function to fetch Street URLs that start with letter [X].
    Saves street OBJECT(s) to file after pagination.
    Returns user feedback.
  */
  await prepStreetUrls();
  // ------ Appends and process ------ END

  console.log("Now done with streets!!!!");

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Get street URLs from OBJECT ++++++ START
    Open and read allStreetsFile.
    Sends to child function to strip Street URLs from street OBJECTS.
    Return chunked url arrays.
  */
  const usableStreets = await gatherStreetUrls();
  // ------ Get street URLs from OBJECT ------ END

  console.log("Now done stripping URLs!!!!");


  // create file for properties for the next step
  files.createProperties();

  // LOG
  files.sysLogs(`Created '${options.fileLocations.propertiesFile}' data file`, "info");
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Gather property objects ++++++ START
    Process the previously chucked arrays.
    Save a properties.json file with property OBJECTS
  */
  await gatherPropertyObjects(usableStreets);
  // ------ Gather property objects ------ END

  console.log("Now done with properties!!!!");

  await gatherPropertyUrls();


  files.sysLogs("JOB DONE!!", "info");
  console.log("JOB DONE!!");
}

// planningApps("https://publicaccess.chesterfield.gov.uk/online-applications/search.do?action=property&type=atoz&letter=A", "z");
// planningApps("https://planning.doncaster.gov.uk/online-applications/search.do?action=property&type=atoz&letter=U", "v");
// planningApps("https://eplanning.derby.gov.uk/online-applications/search.do?action=property&type=atoz&letter=U", "U");

// planningApps("https://planningpublicaccess.southdowns.gov.uk/online-applications/search.do?action=property&type=atoz&letter=A", "z");

module.exports = start;