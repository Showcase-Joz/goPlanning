/*

*/

// required
const gatherPropertyData = require("../processProperties/gatherPropertyData");
const files = require("../utils/fileData");
const helpers = require("../utils/helpers");
const options = files.readConfig();

async function restartProperties(partialRestartArray, tempFileLocation, restartType) {
  // LOG
  files.sysLogs(`
Reading properties data from '${options.fileLocations.propertiesFile}' file...
Attempting to restart and continue the ${restartType} process!!
`);

const newPropertiesUrls = helpers.flatten(partialRestartArray);
// create variables
  let justPropertyArray = [];
  let propertyUrl = "";
  // iterate over chunks array, take out a chunk and pass in
  // for (let i = 0; i < chunkedPropertyUrls.length; i++) {
  //   let chunkedStreet = chunkedPropertyUrls[i];
  // iterate through urls to check health
  for (const property in newPropertiesUrls) {
    if (newPropertiesUrls.hasOwnProperty(property)) {
      propertyUrl = newPropertiesUrls[property].link;
      // push back checkedUrl(s) to the array
      // checkedProperties.push( extractProperties(propertyUrl));
    };
    justPropertyArray.push(propertyUrl);
  };

  // LOG
  files.sysLogs(`Appending to the end of the '${options.fileLocations.propertyFile}' data file.`, "info");
  
  // chunk array and process the items
  const chunkedPropertyUrls = helpers.chunkArrayInGroups(justPropertyArray, 10);
  
  // iterate over chunks array, take out a chunk and pass in
  for (let i = 0; i < chunkedPropertyUrls.length; i++) {
    let chunk = chunkedPropertyUrls[i];

    // iterate through property urls
    for (let url = 0; url < chunk.length; url++) {
      const propertyUrl = chunk[url];
      const modifiedUrl = propertyUrl.replace(/summary/g,"relatedCases");
      // push back checkedUrl(s) to the array
      await gatherPropertyData(modifiedUrl);
    }
  }

  await files.removeFile(tempFileLocation);
  // LOG
  files.sysLogs("JOB DONE (from restart (properties)) !!", "info");
  console.log("Great Job, Thanks for coming!");

  // RETURN
  return;
}
module.exports = restartProperties;