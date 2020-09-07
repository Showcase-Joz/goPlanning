/*
  Creates an alphabet array. Then with the user input, it will work out where the start and end letters fit within the alphabet constraints and sequence all letters between the two.
  There is a fair amount of user feedback generated in this function which allows the user to see what is likely to happen during the next steps in the full process.
  Finally an array is returned from this function.
*/

// requires
const helpers = require("../utils/helpers");
const files = require("../utils/fileData");

function filterAlphabet(initialUrl, endLetter) {
  // create alphabet array
  const textAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphabetArray = textAlphabet.split("");


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     ++++++ Set variables and output ++++++ START
     find/set currentLetter variable
  */
  initialUrl = helpers.lastCharUpper(initialUrl);
  const currentLetter = helpers.urlMatch(initialUrl);
  let currentLocation = helpers.findLetterIndex(currentLetter, alphabetArray);

  // find/set nextLetter variable
  const nextLocation = currentLocation + 1;
  const nextLetter = alphabetArray.find((duff, number) => number === nextLocation);
  const nextUrl = initialUrl.replace(helpers.urlMatch(initialUrl), nextLetter);

  // find/set start/finish variables  
  endLetter = (endLetter === undefined || endLetter === "") ? endLetter = "Z" : endLetter = endLetter.toUpperCase();

  const startAt = currentLetter;
  const finishAt = endLetter;
  const endLocation = helpers.findLetterIndex(finishAt, alphabetArray);
  const endUrl = initialUrl.replace(helpers.urlMatch(initialUrl), endLetter);

  const dif = endLetter === undefined ? (26 - currentLocation) : endLocation - (currentLocation - 1);
  const next = dif > 2 ? `Next:
The next instance will be: letter(${nextLetter}) - index(${nextLocation}),
With the (next url) being: ${nextUrl},` : ``;
  // ------ Set variables and output ------ END


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Create and update letters array ++++++ START
    filter out the letters including and between current/end
  */
  alphabetFiltered = alphabetArray.filter(function (item) {
    return item >= startAt && item <= finishAt;
  }).
  // create new array with only the filtered letters
  map(function (letter) {
    // build the full url string around the filtered letters
    const urlItem = initialUrl.replace(helpers.urlMatch(initialUrl), letter);
    return urlItem;
  });
  // ------ Create and update letters array ------ END


  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ++++++ Create user feedback ++++++ START
    filter out the letters including and between current/end
  */
  // console.clear();
  console.log(`
  Start:
    Scraping will start at:  Letter(${startAt}) - Index(${currentLocation}),
    With the (start url) being: ${initialUrl},

  ${next}
  
  End:
    Finishing at: letter(${finishAt}) - index(${endLocation}),
    With the (last url) being: ${endUrl},

  Totals:
    Alphabet URL's to process: ${dif}
________________________________________________________________________________________
    `);

  // ------ Create user feedback ------ END


  // LOG
  files.sysLogs(`Checking the health of (${dif}) URL letters.`, "info");

  // RETURN
  return alphabetFiltered;
}


module.exports = filterAlphabet;