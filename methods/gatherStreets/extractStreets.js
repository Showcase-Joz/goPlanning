/*
  Instantiate puppeteer after deciding where to get the local chromium instance from.
  Build a JSON object for the street data being read from the unordered list on the URL page.
  Iterate through paginated siblings (for that street letter) until there are no more.
  Close brower instances and return data to parent.
*/


// requires
const instantiantePuppeteer = require("../../service/puppeteerFrame");
const files = require("../utils/fileData");
const options = files.readConfig();

const extractStreets = async (letterUrl) => {
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Instantiate Puppeteer ++++++ START
    Load puppeteer instance up, ready to use and LAUNCH it
    Set consts
    Open puppeteer pages and goBack().
  */
  const processPkg = instantiantePuppeteer.pkgTest();
  const chromiumPath = await instantiantePuppeteer.puppeteerPath(processPkg);
  const browser = await instantiantePuppeteer.browersSet(chromiumPath);

  // what DOM element hold the street(s) list?
  const streetList = "#streetlist li a";

  // init puppeteer
  const page = await browser.newPage();
  
  await page.goto(letterUrl, {
    waitUntil: options.puppeteer.waitUntil,
    timeout: options.puppeteer.timeout
  });
  // ------ Instantiate Puppeteer ------ END


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ++++++ Build JSON object ++++++ START
      Evaluate the DOM element
      Get the streetlist and covert it into an array of objects
  */
  const streetsOnPage = await page.$$eval(streetList,
    streets => streets.map(street => ({
      street: street.innerText,
      link: street.href
    })));
  // ------ Build JSON object ------ END


  await page.goBack();
  await browser.close();


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ++++++ Recursively scrape pages ++++++ START
      Take off the page number and replace with next in series.
      If the next page has more content, concatinate results and continue.
      If the next page has no content, stop and return results
  */
  // Recursively scrape next page
  if (streetsOnPage.length < 1) {
    // Terminate if no streets exist
    return streetsOnPage;
  } else {
    // Get current letterUrl
    const currentPageNumber = parseInt(letterUrl.match(/page=(\d+)$/)[1], 10);
    const nextPageNumber = parseInt(currentPageNumber + 1);

    // convert number to string, to get digit length for the slice method
    const digit = currentPageNumber.toString().length;
    const newStreet = letterUrl.slice(0, -digit);
    
    // Go fetch next page by incrementing ?page=X+1
    const nextUrl = newStreet + nextPageNumber;
    console.log("Next URL: ", nextUrl);

    // add additional arrays (from other pages) to main array
    return streetsOnPage.concat(await extractStreets(nextUrl));
  }
  // ------ Recursively scrape pages ------ END
}
module.exports = extractStreets;