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
  
  const additionalContactData = await page.$$eval(".content", (elements) => {
    const contacts = [];
    const contactItems = Array.from(
      elements[0].querySelectorAll(".tabcontainer")
    );
    for (const item of contactItems) {

      contacts.push({
        [item.querySelector("h3").innerText === null ? "" : item.querySelector("h3").innerText]: {
          [item.querySelector("p").innerText === null ? "" : item.querySelector("p").innerText]: {
            [item.querySelector("th").innerText === null ? "" : item.querySelector("th").innerText]: item.querySelector("td").innerText === null ? "" : item.querySelector("td").innerText,
          }
        }
      });
      console.log(item, 98989898);
    }
    console.log("TEST", contacts, 999);
    return JSON.stringify(contacts);
  });
  await page.goBack();
  await browser.close();

  if (additionalContactData !== null || additionalContactData !== undefined) {
    // LOG
    files.sysLogs("Added contacts data");
    // RETURN
    return additionalContactData;
  } else {
    // LOG
    files.sysLogs("No contacts to add");
    // RETURN
    return;
  }
}
module.exports = extractExtraData;