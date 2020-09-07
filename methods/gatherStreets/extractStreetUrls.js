/*
  Take URL from lettersFile.
  Open child process that iterates through child pages of each street name.
  Save a whole accepted-letter's worth of streets in OBJECTS, to file at once.
  User feedback on number of streets found.
*/

// requires
const extractStreets = require("./extractStreets");
const files = require("../utils/fileData");
const options = files.readConfig();

async function extractStreetUrls(firstUrl) {
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     ++++++ Extract Streets ++++++ START
     Iterates through each accepted-letter.
  */
  let streets = await extractStreets(firstUrl);
  
  // saves an alphabet letter's worth of streets to file each run
  await files.saveExtractedStreets(JSON.stringify(streets));

  // LOG
  files.sysLogs(`Saved to '${options.fileLocations.allStreetsFile}' data file`);
  
  // user feedback on number of streets for each letter
  console.log(`Added (${streets.length}) new streets to '${options.fileLocations.allStreetsFile}' data file`);

  // LOG
  files.sysLogs(`Added (${streets.length}) new streets to '${options.fileLocations.allStreetsFile}' data file`, "info", null);

  // RETURN
  return;
};
module.exports = extractStreetUrls;