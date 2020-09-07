/*
  Collection of small functions that make tasks easier
*/

// convert lower to upper
function lastCharUpper(url) {
  const upper = url.match(/(?<=etter=).+/)[0].toUpperCase();
  const realUrl = url.replace(/.$/, upper);
  return realUrl;
}

// get letter index from array
function findLetterIndex(findLetter, alphabet) {
  return alphabet.findIndex(letter => letter === findLetter);
}

// find letter from url string
function urlMatch(url) {
  return url.match(/etter=([A-Z])/)[1];
}

// flatten a group of arrays
function flatten(arr) {
  return arr.flat();
};

// flatten a group of arrays
function getNestedLength(arr) {
  return arr.flat().length;
};

// split array into puppeteer friendly (10) chunks
function chunkArrayInGroups(arr, size) {
  var myChunks = [];
  for (var i = 0; i < arr.length; i += size) {
    myChunks.push(arr.slice(i, i + size));
  }
  return myChunks;
};

module.exports = {
  lastCharUpper,
  findLetterIndex,
  urlMatch,
  flatten,
  getNestedLength,
  chunkArrayInGroups
}