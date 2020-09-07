/*
  Uses the filterAlphabet resuts to create chunked arrays for further processing.
  Once chunked, check each url (checkPageAttributes) within chuck, then move on to next.
*/

// requires
const filterAlphabet = require("./filterAlphabet");
const checkPageAttributes = require("../checkAlphabet/checkLetterPageAttributes");
const helpers = require("../utils/helpers");
const files = require("../utils/fileData");
const options = files.readConfig();

async function doScrapeLetters(initialUrl, endLetter) {
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Filter alphabet ++++++ START
    returns an array of [alphabet] url's to iterate through
  */
  const paginatedUrls = await filterAlphabet(initialUrl, endLetter);
  // ------ Filter alphabet ------ END


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Iterate over chunks, perform health check ++++++ START
    returned array of chunks. Max [10] + [10] + [6]
  */
  const paginatedUrlChunks = helpers.chunkArrayInGroups(paginatedUrls, 10);
  console.log(`
This machine is using a ${process.platform === "darwin" ? "Mac" : "PC"} platform
  `);

  // LOG
  files.sysLogs(`Running on a ${process.platform === "darwin" ? "Mac" : "PC"} system`);
  /* 
  -- create empty array for urls that pass the health check.
  -- create empty array for the pushed back urls that all.promises (max 10) resolve.
  */
  let checkedUrls = [];
  let results = [];

  // iterate over chunks array, take out a chunk and pass in
  for (let i = 0; i < paginatedUrlChunks.length; i++) {
    let chunk = paginatedUrlChunks[i];

    // iterate through urls to check health
    for (let url = 0; url < chunk.length; url++) {
      const pageUrl = chunk[url];
      // push back checkedUrl(s) to the array
      checkedUrls.push(checkPageAttributes(pageUrl));
    }
    // wait for all the async tasks to finish, then move on to the next chunk
    results = await Promise.all(checkedUrls);
  }

  // filter the healthy pages then flatten to parent array
  let filteredResults = results.filter(pageHealthy => pageHealthy !== undefined);
  const healthyUrls = helpers.flatten(filteredResults);
  // ------ Iterate over chunks, perform health check ------ END


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Save data and give user feedback ++++++ START
    save a copy of the healthy Alphabet urls that will be used.
    clear console.
  */
  files.createAcceptedLetters();
  
  // LOG
  files.sysLogs(`Created '${options.fileLocations.lettersFile}' file`);
  // console.clear();

  // notify user if there are less than expected urls to process.
  if (paginatedUrls.length !== healthyUrls.length) {
    console.warn(`After checking the page structure, there are now only ${healthyUrls.length} (out of the original ${paginatedUrls.length}) URL's to process!!`);
    files.sysLogs(`After checking the page structure, there are now only ${healthyUrls.length} (out of the original ${paginatedUrls.length}) URL's to process!!`, "info");
    
  } else {
    console.log(`All ${healthyUrls.length} URL's are healthy, processing streets next...`);
    // LOG
    files.sysLogs(`Processed (${healthyUrls.length}) healthy URL letters.`, "info");
  };

  // save workable url's to file, to pick up with another process later
  await files.saveAcceptedLetters(healthyUrls);
  // ------Save data and give user feedback ------ END

  // LOG
  console.log(`Saved URL data to '${options.fileLocations.lettersFile}' file`);
  files.sysLogs(`Saved URL data to '${options.fileLocations.lettersFile}' file`);
  console.log("Finished checking Letter URLS", "info");
  files.sysLogs("Finished checking Letter URLS", "info");

  // RETURN
  return;
}
module.exports = doScrapeLetters;