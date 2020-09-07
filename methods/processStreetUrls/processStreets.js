/*
  Takes chucked arrays, iterating over each item.
  Goto street URL, gathering properties from unordered list.
  Save properties to properties.json file.
  Provides user feedback.
*/

// requires
const extractPropertiesUrls = require("../processProperties/extractPropertiesUrls");
const files = require("../utils/fileData");
const helpers = require("../utils/helpers");
const options = files.readConfig();

async function gatherPropertyObjects(chunkedStreetUrls) {
  

  // iterate over chunks array, take out a chunk and pass in
  for (let i = 0; i < chunkedStreetUrls.length; i++) {
    let chunk = chunkedStreetUrls[i];

    // iterate through urls to check health
    for (let url = 0; url < chunk.length; url++) {
      const streetUrl = chunk[url];

      // push back checkedUrl(s) to the array
      await extractPropertiesUrls(streetUrl);
    }
  }
  const propertiesCount = files.readProperties();

  // LOG
  files.sysLogs(`Read from '${options.fileLocations.propertiesFile}' data file`);
  const streetCount = propertiesCount.length;
  const propertyCount = helpers.flatten(propertiesCount).length;

  // console.clear();
  console.log(`
There are (${propertyCount}) properties added to the '${options.fileLocations.propertiesFile}' file from (${streetCount}) street's
`);

  // LOG
  files.sysLogs(`Added (${propertyCount}) properties to '${options.fileLocations.propertiesFile}' from (${streetCount}) street's`, "info");
  files.sysLogs("Finished gathering Street URL's", "info");
  
  // RETURN
  return;
}
module.exports = gatherPropertyObjects;