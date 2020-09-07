/*
  Instantiate puppeteer after deciding where to get the local chromium instance from.
  Take URL, open it and check page has usable attributes.
  Add page to healthy array OR notify user that a certain URL doesn't work.
  Close brower instances and return array.
*/

// requires
const instantiantePuppeteer = require("../../service/puppeteerFrame");
const files = require("../utils/fileData");
const options = files.readConfig();

// checkPageAttributes FUNCTION CALL

async function checkPageAttributes(url) {
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     ++++++ Instantiate Puppeteer ++++++ START
     load puppeteer instance up, ready to use and LAUNCH it
  */
  const processPkg = instantiantePuppeteer.pkgTest();
  const chromiumPath = await instantiantePuppeteer.puppeteerPath(processPkg);
  const browser = await instantiantePuppeteer.browersSet(chromiumPath);
  // ------ Instantiate Puppeteer ------ END

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     ++++++ Basic Puppeteer usage ++++++ START
     Open a page and user feedback
  */
 
  const page = await browser.newPage();
  // inform user "checking"
  console.log(`Checking health of page:... ${url}`);

  await page.goto(url, {
    waitUntil: options.puppeteer.waitUntil,
    timeout: options.puppeteer.timeout
  });


  // ------ Basic Puppeteer usage ------ END


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     ++++++ Run page attribute tests ++++++ START
     Work into the DOM looking for attributes
     criteriaLetters (parent pagination) div ID to search DOM for.
     criteriaPageNumbers (child pagination) div ID to search DOM for.
     check if both ID's are on the page.
  */
  const criteriaLetters = "#atoz";
  const criteriaPageNumbers = "#streetlist";
  const checkUrls = [];

  try {
    await page
      .waitForSelector(criteriaLetters && criteriaPageNumbers, {
        timeout: options.puppeteer.selectorTimeout
      });

    checkUrls.push(url);
    await page.goBack();
  } catch (error) {
    await page.goBack();
    console.log(`
The URL: ${url}
  ...doesn't have the correct ${criteriaLetters} OR ${criteriaPageNumbers} div ID.
Please check this URL manually - No data will be gathered from this URL!`);

    // LOG
    files.sysLogs(`Error's with this URL: (${url}),
  Check details for further reference`, "error", `${error.toString()} with ${url}`);
  }
  // ------ Run page attribute tests ------ END


  // close browsers and retun an array of urls
  await browser.close();

  // RETURN
  return checkUrls;
}
module.exports = checkPageAttributes;