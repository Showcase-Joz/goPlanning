/*
  Opens a subpage URL.
  Finds a DOM element and works out where the required data is.
  Pushes data to an array, stringify's and returns to parent method
*/

// requires
const instantiantePuppeteer = require("../../service/puppeteerFrame");
const files = require("../utils/fileData");
const options = files.readConfig();

async function extractExtraData(url) {


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

  await page.goto(url, {
    waitUntil: options.puppeteer.waitUntil,
    timeout: options.puppeteer.timeout
  });
  
  const additionalDatesData = await page.$$eval(".content", (elements) => {
    const date = [];
    const dateItems = Array.from(
      elements[0].querySelectorAll("#simpleDetailsTable > tbody > tr")
    );
    for (const item of dateItems) {

      date.push({
        [item.querySelector("th").innerText === null ? "" : item.querySelector("th").innerText]: item.querySelector("td").innerText === null ? "" : item.querySelector("td").innerText,
      });
    }
    return JSON.stringify(date);
  });
  await page.goBack();
  await browser.close();

  if (additionalDatesData !== null || additionalDatesData !== undefined) {
    // LOG
    files.sysLogs("Added important dates data");
    // RETURN
    return additionalDatesData;
  } else {
    // LOG
    files.sysLogs("No important dates to add");
    // RETURN
    return;
  }
}
module.exports = extractExtraData;