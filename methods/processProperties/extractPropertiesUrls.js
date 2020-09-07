/*
  Iterates over street urls, paginating if necessary.
  Creates a property OBJECT
  Saves a complete street's worth of properties to file at once.
*/
// requires
const instantiantePuppeteer = require("../../service/puppeteerFrame");
const files = require("../utils/fileData");
const options = files.readConfig();

async function extractProperties(firstUrl) {
  console.log("Checking street: ", firstUrl);


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
  // ------ Instantiate Puppeteer ------ END

  const extractProperties = async (street) => {
    console.log("Checking next pagination: ", street);

    // what DOM element hold the search results?
    const searchResults = "#searchresults li a";

    try {
      await page.goto(street, {
        waitUntil: options.puppeteer.waitUntil,
        timeout: options.puppeteer.timeout
      });
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

    // create an OBJECT variable for each property and associated url
    const propertiesOnPage = await page.$$eval(searchResults,
      properties => properties.map(property => ({
        property: property.innerText,
        link: property.href
      })));

    const subStreet = street.match(/(streetKeyValue=)([\A-Z0-9]*)[^&#\s]*/g) ? true : false;

    await page.goBack();
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ++++++ Recursively scrape pages ++++++ START
      Take off the page number and replace with next in series.
      If the next page has more content, concatinate results and continue.
      If the next page has no content, stop and return results
    */
    // Recursively scrape next page
    if (!subStreet) {
      const currentPageNumber = parseInt(street.match(/page=(\d+)$/)[1], 10);
      const nextPageNumber = parseInt(currentPageNumber + 1);
      // convert number to string, to get digit length for the slice method
      const digit = currentPageNumber.toString().length;
      const newStreet = street.slice(0, -digit);

      // Go fetch next page by incrementing ?page=X+1
      const nextUrl = newStreet + nextPageNumber;
      // console.log("sub street url", street);
      // console.log(nextUrl);

      // console.log(propertiesOnPage);
      if (propertiesOnPage < 1) {
        // if the next list of items
        return propertiesOnPage;
      } else {
        // add additional arrays (from other pages) to main array
        return propertiesOnPage.concat(await extractProperties(nextUrl));
      }
    } else if (subStreet) {
      // strip off the of the url and add subExtension on to the domain string.
      street = street.match(/(.*?)(alphabeticalSearchResults.do\?)/g);
      const subExtension = "action=page&searchCriteria.page=2";
      street = street + subExtension;
      // add additional arrays (from other pages) to main array
      return propertiesOnPage.concat(await extractProperties(street));
    } else if (propertiesOnPage.length < 1) {
      console.log("<1");
      // Terminate if no streets exist
      return propertiesOnPage;
    } else {
      console.log("run props");
      // add additional arrays (from other pages) to main array
      return propertiesOnPage.concat(await extractProperties(firstUrl));
    }
  }


  let properties = await extractProperties(firstUrl);
  files.sysLogs(`Extracting (${properties.length}) to '${options.fileLocations.propertiesFile}'`, "info", null);
  await files.saveToProperties(JSON.stringify(properties));

  // LOG
  files.sysLogs(`Saved data to '${options.fileLocations.propertiesFile}' file from ${firstUrl}`);

  await browser.close();

  // RETURN
  return;
}
module.exports = extractProperties;