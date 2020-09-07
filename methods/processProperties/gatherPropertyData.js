/*
  Instantiate puppeteer after deciding where to get the local chromium instance from.
  Use url to find property page.
  Gather planning applications from property page.
  Create OBJECT(s) for each application at property.
  Close brower instances and return data to parent.
*/


// requires
const instantiantePuppeteer = require("../../service/puppeteerFrame");

const appendExtraData = require("./appendExtraData");
const files = require("../utils/fileData");
const options = files.readConfig();

async function propertyData(url) {
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Instantiate Puppeteer ++++++ START
    Load puppeteer instance up, ready to use and LAUNCH it
    Set consts
    Open puppeteer pages and goBack().
*/
  const processPkg = instantiantePuppeteer.pkgTest();
  const chromiumPath = await instantiantePuppeteer.puppeteerPath(processPkg);
  const browser = await instantiantePuppeteer.browersSet(chromiumPath);

  const page = await browser.newPage();

  try {
    // const response = await page.goto(url, {
    await page.goto(url, {
      waitUntil: options.puppeteer.waitUntil,
      timeout: options.puppeteer.timeout
    });

    await page.waitForSelector("span.address", {
      timeout: options.puppeteer.selectorTimeout
    });

    console.log("URL", url);

    // LOG
    files.sysLogs(`Scraping: ${url}`);

    // create OBJECT varaiable with 
    const propertiesOnPage = await page.$$eval(".content", (elements) => {
      const result = [];
      const addressSpan = elements[0].querySelector("span.address");
      const address = addressSpan.textContent.trim();
      const listItems = Array.from(
        elements[0].querySelectorAll("#Application > ul > li")
      );

      // JUST THE keyVal
      // function reducePropertyUrl(url) {
      //   const keyId = url.match(/(?<=keyVal=)([A-Z,0-9]*)/g)[0];
      //   // const summaryString = "&activeTab=summary";
      //   // const shortUrl = keyId + summaryString;
      //   return keyId;
      // }
      // MIDDLE GROUND STRING
      function reducePropertyUrl(url) {
        const keyId = url.match(/(.*keyVal=)([A-Z,0-9]*)/g)[0];
        const summaryString = "&activeTab=summary";
        const shortUrl = keyId + summaryString;
        return shortUrl;
      }

      // For each application found at the address, get the address string and url for the "specific" application
      for (let listItem of listItems) {
        // create mini object of data items
        result.push({
          address,
          application: {
            link: reducePropertyUrl(listItem.querySelector("a").href),
          }
        });
      }
      return result;
    });

    /* if data exists...
    Get propertiesOnPage and iterate through them IF they have a length.
    Run child method to scrape "summary".
    Append the "summary" data to the end of the object as new property/value pairs.
    Write to file and give user feedback on successful application found
  */
    if (propertiesOnPage.length > 0) {
      await appendExtraData(propertiesOnPage);

      // save property data to file
      files.savePropertyData(propertiesOnPage);

      // get address from object
      let count = propertiesOnPage.length === undefined || propertiesOnPage.length === null ? 0 : propertiesOnPage.length - 1;
      const addressObject = propertiesOnPage[count];
      const newProperty = addressObject[Object.keys(addressObject)[0]];
      // user feedback
      console.log(`Found and wrote (an application for) ${newProperty} to file`);
      // LOG
      files.sysLogs(`Saved ${newProperty} to '${options.fileLocations.propertyFile}' data file`, "info", null);
    }
  } catch (error) {

    // add node go-restart call here!!!!
    console.log(`This is pid: ${process.pid}, argv's are: ${process.argv}`);
    if (process.argv[2].includes("restart")) {
      files.sysLogs(`Attempting to respawn from a 'gatherPropertyData' error`, "warning", `${error.toString()}`);

      setTimeout(function () {
        process.on("exit", function () {
          console.log(process.argv, "this is ARGV at crash");
          require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached: true,
            stdio: "inherit"
          });
        });
        process.exit();
      }, 5000);
    } else {
      files.sysLogs(`'waitForSelector' error. Killing PId: ${process.pid}`, "warning", `${error.toString()}`);
      process.kill(process.pid);
    }

  }

  await page.goBack();
  await browser.close();

  // RETURN
  return;
}
module.exports = propertyData;