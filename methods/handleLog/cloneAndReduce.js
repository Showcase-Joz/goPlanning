/*
  Takes the partsArray and works out if the process stopped on the properties or property step.
  Creates a temp file to copy one of the two files into.
  Calls reduceData to find the last successful save (from the log file) and removes all previous entries.
  Returns reduced data to file and sends it on for processing.
*/


// requires
const reduceData = require("./reduceData");
const files = require("../utils/fileData");
const options = files.readConfig();

async function cloneAndReduce(partsArray) { 
  if (partsArray[1].toString().includes(`${options.fileLocations.propertiesFile}`)) {
    console.log(`It looks like the process stopped whilst collecting 'properties data' for the ${options.fileLocations.propertiesFile} file.`);
    console.info("Trying to restart from here!!");

    // can use "properties", "property" to get respective fileSrc
    const fileLocation = files.fileSrc("properties");
    // copy data from file tp a temp
    const tempFile = await files.copyFile(fileLocation);
    // read and reduce data based on what was logged last
    const dataToReduce = await files.readFromTemp(tempFile);
    const reducedData = await reduceData(dataToReduce, partsArray[0]);    
    // write reduced data back to file
    await files.writeToTemp(reducedData, tempFile);

    // RETURN
    return [reducedData, tempFile, "properties"];
  } else if (partsArray[1].toString().includes(`${options.fileLocations.propertyFile}`)) {
    console.log(`It looks like the process stopped whilst collecting 'property data' for the ${options.fileLocations.propertyFile} file.`);
    console.info("Trying to restart from here!!");

    // can use "properties", "property" to get respective fileSrc
    const fileLocation = files.fileSrc("property");
    // copy data from file tp a temp
    const tempFile = files.copyFile(fileLocation);
    // read and reduce data based on what was logged last
    const dataToReduce = files.readFromTemp(tempFile);
    const reducedData = await reduceData(dataToReduce, partsArray[0]);
    
    // write reduced data back to file
    await files.writeToTemp(reducedData, tempFile);

    // RETURN
    return [reducedData, tempFile, "property"];
  }
}
module.exports = cloneAndReduce;