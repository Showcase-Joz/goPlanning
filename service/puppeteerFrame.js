/*
  Reusable puppeteer instance
  Checks location of Chromium based on platform type
*/


// INSTRUCTIONS - copy (and uncomment) below snippet, then require puppeteerFrame.js
// /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//      ++++++ Instantiate Puppeteer ++++++ START
//      load puppeteer instance up, ready to use and LAUNCH it
//   */
//  const processPkg = instantiantePuppeteer.pkgTest();
//  const chromiumPath = await instantiantePuppeteer.puppeteerPath(processPkg);
//  const browser = await instantiantePuppeteer.browersSet(chromiumPath);
//  // ------ Instantiate Puppeteer ------ END


// requires
const path = require("path");
const puppeteer = require("puppeteer");
const files = require("../methods/utils/fileData");
const options = files.readConfig();

function pkgTest() {
  // determine installation platform
  const isPkg = typeof process.pkg !== 'undefined';
  return isPkg;
}

async function puppeteerPath(isPkg) {
  // PUPPETEER requires stuff
  // const path = require("path");
  // const puppeteer = require("puppeteer");

  // IF mac - path replace
  let chromiumExecutablePath = (isPkg ?
    puppeteer.executablePath().replace(
      /^.*?\/node_modules\/puppeteer\/\.local-chromium/,
      path.join(path.dirname(process.execPath), 'chromium')
    ) :
    puppeteer.executablePath()
  );

  // IF win32 - path replace
  if (process.platform == 'win32') {
    chromiumExecutablePath = (isPkg ?
      puppeteer.executablePath().replace(
        /^.*?\\node_modules\\puppeteer\\\.local-chromium/,
        path.join(path.dirname(process.execPath), 'chromium')
      ) :
      puppeteer.executablePath()
    );
  }
  return chromiumExecutablePath;
}

async function browersSet(chromiumPath) {
  let browser;
  if (process.platform === "darwin") {
    browser = await puppeteer.launch({
      executablePath: chromiumPath,
      product: options.puppeteer.product,
      headless: options.puppeteer.headless,
      ignoreHTTPSErrors: options.puppeteer.ignoreHTTPS,
      slowMo: options.puppeteer.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    })
  } else if (process.platform === "win32") {
    browser = await puppeteer.launch({
      executablePath: chromiumPath,
      product: options.puppeteer.product,
      headless: options.puppeteer.headless,
      ignoreHTTPSErrors: options.puppeteer.ignoreHTTPS,
      slowMo: options.puppeteer.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  } else {
    browser = await puppeteer.launch({
      product: options.puppeteer.product,
      headless: options.puppeteer.headless,
      ignoreHTTPSErrors: options.puppeteer.ignoreHTTPS,
      slowMo: options.puppeteer.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

module.exports = {
  pkgTest,
  puppeteerPath,
  browersSet
}