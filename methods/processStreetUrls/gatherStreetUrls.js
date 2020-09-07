/*
  Reads array from file and flattens the included streets into a parant array.
  Iterates over objects within the array and takes out the 
*/

// requires
const files = require("../utils/fileData");
const helpers = require("../utils/helpers");
const options = files.readConfig();

async function prepPropertyUrls() {
  // read and flatten array of allStreetsFile
  const fetchedStreetUrls = helpers.flatten(files.readAccessibleStreets());

  // create vars
  let justStreetsArray = [];
  let streetUrl = "";

  // iterate through urls fetching the URL from each object
  for (const street in fetchedStreetUrls) {
    if (fetchedStreetUrls.hasOwnProperty(street)) {
      streetUrl = fetchedStreetUrls[street].link;
    };
    // add urls to a new array
    justStreetsArray.push(streetUrl);
  };

  // save streets urls for further processing
  files.createUsableStreetUrls();

  // LOG
  files.sysLogs(`Created '${options.fileLocations.workableStreets}' data file`, "info");

  await files.saveUsableStreets(JSON.stringify(justStreetsArray));
  
  // LOG
  files.sysLogs(`Saved to '${options.fileLocations.workableStreets}' data file`);

  const streetUrls = await files.readUsableStreetUrls();

  // LOG
  files.sysLogs(`Read from '${options.fileLocations.workableStreets}' file`);
  
  // chunk array into manageable pieces
  const chunkedStreetUrls = helpers.chunkArrayInGroups(streetUrls, 10);

  // RETURN
  return chunkedStreetUrls;
}
module.exports = prepPropertyUrls;