/*
  Opens and reads Log file.
  Converts strings to array and strips out blank lines.
  Reverses array and gets first (last) successful "Saved " item for BOTH propertyFile and propertiesFile.
  Cuts usable parts of string [workingProperty, workingProperties, lastAddress, lastUrl].
  Returns a two item array based on which of the two (propertyFile and propertiesFile) two saved to log last.
*/

// requires
const files = require("../utils/fileData");
const helpers = require("../utils/helpers");

async function findLastEntry() {
  
  // set variables
  let lastAddress = "";
  let lastUrl = "";
  let workingPropertyFN = "";
  let workingPropertiesFN = "";
  const sysLog = files.readSysLog();
  let text = [];
  text.push(sysLog.split(/(.*,{1})\r?\n|\r/));

  // set regex constants
  const lastPropertyEvent = /((?![-*!]{3,})Saved(?!\sdata|\sto))(.+?(?=\s[-*!]{3,}))/g;
  const lastPropertiesEvent = /((?![-*!]{3,})(?<=Saved data to ).+?(http))(.+(?=\s[-*!]{3,}))/g;
  const finishedEvent = /((?![!]{3,}).+?(Great Job,))/g;
  const getAddress = /((?<=Saved ).+(?= to))/g;
  const getURL = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
  const getPropertyFileName = /((?<=to ').+(?=' data file))/g;
  const getPropertiesFileName = /((?<=to ').+(?=' file from))/g;

  // flatten newly created array (from log text file)
  filtered = helpers.flatten(text);

  function removeBlanks(value) {
    return value !== '';
  }

  // remove blank lines from array and reverse the order of array
  let filteredLog = filtered.filter(removeBlanks).reverse();

  const lastPropertyLocation = filteredLog.findIndex(value => lastPropertyEvent.test(value));
  const lastPropertiesLocation = filteredLog.findIndex(value => lastPropertiesEvent.test(value));
  let finishedProcess = filteredLog.findIndex(value => finishedEvent.test(value));
  
  const workingProperty = filteredLog[lastPropertyLocation];
  const workingProperties = filteredLog[lastPropertiesLocation];

  if (finishedProcess === -1) {
    finishedProcess = 9007199254740991;
  }

  if (lastPropertyLocation > -1) {
    lastAddress = workingProperty.match(getAddress);
    workingPropertyFN = workingProperty.match(getPropertyFileName);
  }

  if (lastPropertiesLocation > -1) {
    lastUrl = workingProperties.match(getURL);
    workingPropertiesFN = workingProperties.match(getPropertiesFileName);
  } 

  // console.log("property",lastPropertyLocation, "properties",lastPropertiesLocation, "finished", finishedProcess);

  // RETURN
  if (lastPropertiesLocation < lastPropertyLocation && lastPropertiesLocation < finishedProcess) {
    return [lastUrl, workingPropertiesFN];
  } else if (lastPropertyLocation < lastPropertiesLocation && lastPropertyLocation < finishedProcess) {
    return [lastAddress, workingPropertyFN];
  } else if (finishedProcess < lastPropertyLocation && finishedProcess < lastPropertiesLocation) {
    return null;
  }
}
module.exports = findLastEntry;