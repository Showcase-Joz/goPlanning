/*
  Accepts a nested array and a string.
  Decides which approach to take, based on string structure.
  Checks appropriate file in attempt to find the string.
  Removes all data before string (in file) if found.
  If not found, recommends via user feedback that entire process
    will need to be restarted because data is missing.
*/

// requires
const files = require("../utils/fileData");
const helpers = require("../utils/helpers");
const options = files.readConfig();

async function reduceData(data, queryString) {
  const isURL = /(http|https)/g;
  const searchItem = queryString.toString();

  if (isURL.test(searchItem)) {
    console.log("PROPERTIES OPTION");
    files.sysLogs(`Checking ${options.fileLocations.workableStreets} file for ${searchItem}...
The last found entry that is usable was from the PROPERTIES (step-3) process!

Continuing from here`, "info");
    console.log(`Checking ${options.fileLocations.workableStreets} file for ${searchItem}`);
    const removableArrayItems = data.indexOf(searchItem);
    const cleanData = data.slice(removableArrayItems);
    return cleanData;
  } else {
    console.log("PROPERTY OPTION");
    files.sysLogs(`Checking ${options.fileLocations.propertiesFile} file for ${searchItem}...
The last found entry that is usable was from the PROPERTY (step-4) process!

Continuing from here`, "info")
    console.log(`Checking ${options.fileLocations.propertiesFile} file for ${searchItem}`);
    for (const arr of data) {
      for (const item in arr) {
        if (arr.hasOwnProperty(item)) {
          const address = arr[item].property;
          if (address === searchItem) {
            // get relevant index's 
            const removeObjectItems = arr.indexOf(arr[item]);
            const removeArrayItems = data.indexOf(arr);
            // remove processed object items from child
            const newArr = arr.splice(removeObjectItems+1);
            // remove processed array items from parent
            const cleanData = data.slice(removeArrayItems+1);
            // add (any) partial objects from last array item before it was removed above
            cleanData.unshift(newArr);          
            // RETURN
            return cleanData;
          }
        }
      }
    }
  }
  console.log(`Can't find ${searchItem} in ${options.fileLocations.propertiesFile}. The data may be corrupt.
It's worth starting over with this scrape job!!`);
  // LOG
  files.sysLogs(`Can't find ${searchItem} in ${options.fileLocations.propertiesFile}, possibly corrupt data file`, "debug");
  
  // RETURN
  return cleanData;
}
module.exports = reduceData;