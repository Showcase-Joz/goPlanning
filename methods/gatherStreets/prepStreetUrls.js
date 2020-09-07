/*
  Takes lettersFile from file.
  Add's a string to the end of each URL.
  Passes new URL to a child process to gather (paginated) streets from that letter.
  Gives user feedback on the number of (child) processed streets, over [X] letters.
*/

// requires
const extractStreetUrls = require("./extractStreetUrls");
const helpers = require("../utils/helpers");
const files = require("../utils/fileData");
const options = files.readConfig();

async function prepStreetUrls() {
  // Read healthy URLs from file
  const healthyUrls = files.readAcceptedLetters();

  // LOG
  files.sysLogs(`Read data from '${options.fileLocations.lettersFile}' data file`);

  // add to the current url(s) 
  const urlPagesExtesion = "&streetsPager.resultsPerPage=10&streetsPager.page=1";

  // LOG
  files.sysLogs(`Adding ${urlPagesExtesion} to the end of each url`);

  // Create file for the street objects
  files.createAccessibleStreets();

  // LOG
  files.sysLogs(`Created '${options.fileLocations.allStreetsFile}' data file`);

  for await (const url of healthyUrls) {

    // display current Alphabet URL to uses (console)
    console.log("Currently processing URL: ", url);

    // uses a file save call in extractStreetUrls module to save out each alphabet letter's worth of street's each run
    await extractStreetUrls(url + urlPagesExtesion);

    // push to array items that are being processed under current alphabet letter
    // streetsArray.push(await extractStreetUrls(url + urlPagesExtesion));
  }

  const countStreets = await files.readAccessibleStreets();
  const totalStreetCount = helpers.flatten(countStreets);
  
  // console.clear();
  console.log(`
There are ${totalStreetCount.length} street's added to the '${options.fileLocations.workableStreets}' data file,
from ${countStreets.length} healthy letter URL's
`);

  // LOG
  files.sysLogs(`Adding (${totalStreetCount.length}) streets to '${options.fileLocations.workableStreets}' from ${countStreets.length} healthy letter URL's`, "info");
  files.sysLogs("Finished processing Letter URLS", "info");
  
  // RETURN
  return;
}

module.exports = prepStreetUrls;