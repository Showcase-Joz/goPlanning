/*

*/

// requires
const gatherPropertyData = require("./gatherPropertyData");
const files = require("../utils/fileData");
const helpers = require("../utils/helpers");
const options = files.readConfig();

async function collectData() {
  // create a file to store the [property-data.json] in
  files.createPropertyData();

  // LOG
  files.sysLogs(`Created '${options.fileLocations.propertyFile}' data file`, "info");

  const newPropertiesUrls = helpers.flatten(files.readProperties());

  // LOG
  files.sysLogs(`Read from '${options.fileLocations.propertiesFile}' data file`);

  let justPropertyArray = [];

  let propertyUrl = "";
  // iterate over chunks array, take out a chunk and pass in
  // for (let i = 0; i < chunkedStreetUrls.length; i++) {
  //   let chunkedStreet = chunkedStreetUrls[i];
  // iterate through urls to check health
  for (const property in newPropertiesUrls) {
    if (newPropertiesUrls.hasOwnProperty(property)) {
      propertyUrl = newPropertiesUrls[property].link;
      // push back checkedUrl(s) to the array
      // checkedProperties.push( extractProperties(propertyUrl));
    };
    justPropertyArray.push(propertyUrl);
    // console.log(propertyUrl);
  };

  // };
  // wait for all the async tasks to finish, then move on to the next chunk
  // results = await Promise.all(checkedProperties);


  const chunkedStreetUrls = helpers.chunkArrayInGroups(justPropertyArray, 10);
  
  // iterate over chunks array, take out a chunk and pass in
  for (let i = 0; i < chunkedStreetUrls.length; i++) {
    let chunk = chunkedStreetUrls[i];

    // iterate through urls to check health
    for (let url = 0; url < chunk.length; url++) {
      const propertyUrl = chunk[url];
      const modifiedUrl = propertyUrl.replace(/summary/g,"relatedCases");
      // push back checkedUrl(s) to the array
      await gatherPropertyData(modifiedUrl);
      // wait for all the async tasks to finish, then move on to the next chunk
      // await Promise.all(checkedProperties);

      // const healthyString = JSON.stringify(results);

      // console.log(healthyString);
      
      // create a file for the properties
      // files.appendProperties(healthyString);
    }
  }
  console.log("Great Job, Thanks for coming!");
  files.sysLogs("Great Job, Thanks for coming!", "info")

  // RETURN
  return;
}
module.exports = collectData;