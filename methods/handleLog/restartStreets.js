/*

*/

//requires
const gatherPropertyObjects = require("../processStreetUrls/processStreets");
const gatherPropertyUrls = require("../processProperties/gatherPropertyUrls");
const files = require("../utils/fileData");

async function restartStreets(usableStreets, tempFileLocation) {
  // ------ Get street URLs from OBJECT ------ END


  // ADDAPT THIS PROCESS TO "NOT" CREATE NEW FILE IF ALREADY EXISTS!!!! 
  console.log("Now RE-gathering properties!!!!");

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Gather property objects ++++++ START
    Process the previously chucked arrays.
    Save a properties.json file with property OBJECTS
  */
  await gatherPropertyObjects(usableStreets);
  // ------ Gather property objects ------ END

  console.log("Now done with properties!!!!");

  await gatherPropertyUrls();
  await files.removeFile(tempFileLocation);
  files.sysLogs("JOB DONE (from restart (streets)) !!", "info");
  console.log("Great Job, Thanks for coming!");
}

module.exports = restartStreets;