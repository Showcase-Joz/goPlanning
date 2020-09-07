/*

*/

// requires
const extractSummaryData = require("./extractSummaryData");
const extractFurtherData = require("./extractFurtherData");
const extractContactsData = require("./extractContactsData");
const extractDatesData = require("./extractDatesData");
const files = require("../utils/fileData");
const options = files.readConfig(); 

async function appendExtraData(propertiesOnPage) {
  // Get an ID (application index) from the object
  for (let applicationID = 0; applicationID < propertiesOnPage.length; applicationID++) {
    // Get the applicaton URL, visit the page and scrape "summary" prop/value pairs
    const extractedSummaryInfo = await extractSummaryData(propertiesOnPage[applicationID].application.link);
    const extractedFurtherInfo = await extractFurtherData(propertiesOnPage[applicationID].application.link.replace("&activeTab=summary", "&activeTab=details"));;
    const extractedContactsInfo = await extractContactsData(propertiesOnPage[applicationID].application.link.replace("&activeTab=summary", "&activeTab=contacts"));
    const extractedDatesInfo = await extractDatesData(propertiesOnPage[applicationID].application.link.replace("&activeTab=summary", "&activeTab=dates"));

    // Make returned data usable
    const summaryInfo = JSON.parse(extractedSummaryInfo);
    const furtherInfo = JSON.parse(extractedFurtherInfo);
    const contactInfo = JSON.parse(extractedContactsInfo);
    const datesInfo = JSON.parse(extractedDatesInfo);

    // Merge all sub-method return objects into one
    const allInfo = [...summaryInfo, ...furtherInfo, ...contactInfo, ...datesInfo];
    // filter out usless item/rows
    const removeValues = options.propertySetting.uselessValuePairs;
    // Add the prop/value pairs to the mini object created earlier
    for await (const object of allInfo) {
      for (const key in object) {
        if (!removeValues.some(v => Object.values(object).includes(v))) {
          propertiesOnPage[applicationID].application[key] = object[key];
        }
      }
    }
  }
}
module.exports = appendExtraData;