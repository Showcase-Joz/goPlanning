/*
  Processes for CRUD file system
*/

// requires
const fs = require("fs");
const path = require("path");
const appDir = path.resolve("./");
const settingsPath = path.join(appDir, "settings");
const configStr = path.join(settingsPath, "config.json");
const os = require("os");
const axios = require("axios");


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Set variables that are based on ./config.json file objects
*/
let options = {};
let outputFolderOption = "";
let outputFolder = "";
let logsPath = "";
let aLPath = "";
let aSPath = "";
let uSUPath = "";
let pPath = "";
let pDPath = "";


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read options from the config file and (possibly) update variables based on that.
*/
const readConfig = () => {
  const bufferedData = fs.readFileSync(configStr, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read Config: ", err);
    }
    return dataFromFile;
  });

  options = JSON.parse(bufferedData);

  outputFolderOption = path.join(appDir, options.fileLocations.outputFolder);
  outputFolder = outputFolderOption !== undefined ? outputFolderOption : "data";
  logsPath = path.join(appDir, options.fileLocations.outputFolder, options.fileLocations.logsFile);
  aLPath = path.join(appDir, options.fileLocations.outputFolder, options.fileLocations.lettersFile);
  aSPath = path.join(appDir, options.fileLocations.outputFolder, options.fileLocations.allStreetsFile);
  uSUPath = path.join(appDir, options.fileLocations.outputFolder, options.fileLocations.workableStreets);
  pPath = path.join(appDir, options.fileLocations.outputFolder, options.fileLocations.propertiesFile);
  pDPath = path.join(appDir, options.fileLocations.outputFolder, options.fileLocations.propertyFile);
  
  return options;
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// WRITE options to the config file
const writeConfig = (replaceData) => {
  options = replaceData;
  const convertToStringify = JSON.stringify(replaceData);
  // write command
  fs.writeFileSync(configStr, convertToStringify, {
    flag: "w"
  });
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Check if base folder exists already
*/
const folderExist = () => {
  try {
    // folder exists...
    if (fs.existsSync(outputFolder)) {
      // check if to reset folder and create log
      if (options.resetOnStart) {
        resetDataFolder();
        createSysLogs();
      }
    } else {
      // folder doesn't exist, mkfolder and create log
      fs.mkdirSync(outputFolder, (err) => {
        if (err) {
          return console.log("Error from fs MkDir: ", err);
        }
      })
      createSysLogs();
    }
  } catch (error) {
    console.log("log err", error);
  }
  return outputFolderOption;
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Check if file exists already
*/
const fileExist = async (checkFile) => {
  try {
    // file exists...
    if (fs.existsSync(await checkFile)) {
      // check is true
      return true;
    } else {
      // check is false
      return false;
    }
  } catch (error) {
    // write a log for feedback
    console.log(error);
    sysLogs(`There is an Error: ${error},
regarding the 'fileExist' method`, "warning");
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Remove then Create data folder
*/
const resetDataFolder = () => {
  fs.rmdirSync(outputFolder, {
    recursive: true
  }, (err) => {
    if (err) {
      return console.log("Error from fs RmDir: ", err);
    }
  })

  fs.mkdirSync(outputFolder, (err) => {
    if (err) {
      return console.log("Error from fs MkDir: ", err);
    }
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create SYS LOG
*/

const createTyphonLog = async (newPost) => {
  const body = JSON.stringify(newPost);
  const url = options.logs.typhonSettings.url;

  const config = {
    headers: options.logs.typhonSettings.headers
  }
  try {
    // try sending log to Typhon
    const res = await axios.post(url, body);
    sysLogs(`'res.data' sent to Typhon successfully`);
  } catch (error) {
    console.log(`Typhon try/catch error: ${error}`, "warning");
    sysLogs(`Typhon try/catch error: ${error}`, "warning");
  }
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create SYS LOG
*/
const createSysLogs = () => {
  const initLog = `Log file key: ${options.logs.symbols.info} (info), ${options.logs.symbols.debug} (debug), ${options.logs.symbols.error} (error), ${options.logs.symbols.warning} (warning), ${options.logs.symbols.default} (default),
${new Date().toLocaleString()} --- Created logs ---,

`
  // CREATE new STREET file with empty array in it
  fs.writeFileSync(logsPath, initLog, function (err) {
    if (err) {
      return console.log("Error from fs Create Logs: ", err);
    }
    console.log("created log file to record process steps, times, comments and errors");
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Add SYS LOG
*/
const sysLogs = async (logMsg, msgType, anyDetails) => {
  let updateLogMsg = "";
  switch (msgType) {
    case "info":
      updateLogMsg = `${new Date().toLocaleString()} ${options.logs.symbols.info} ${logMsg} ${options.logs.symbols.info},
`
      if (options.logs.typhon) await createTyphonLog({
        host: options.logs.typhonSettings.host !== "" ? options.logs.typhonSettings.host : os.hostname(),
        namespace: options.logs.typhonSettings.namespace,
        name: `${options.fileLocations.outputFolder}.${options.logs.typhonSettings.name}`,
        type: msgType,
        description: logMsg,
      });
      break;
    case "debug":
      updateLogMsg = `${new Date().toLocaleString()} ${options.logs.symbols.debug} ${logMsg} ${options.logs.symbols.debug},
`
      if (options.logs.typhon) await createTyphonLog({
        host: options.logs.typhonSettings.host !== "" ? options.logs.typhonSettings.host : os.hostname(),
        namespace: options.logs.typhonSettings.namespace,
        name: `${options.fileLocations.outputFolder}.${options.logs.typhonSettings.name}`,
        type: msgType,
        description: logMsg,
      });
      break;
    case "error":
      updateLogMsg = `${new Date().toLocaleString()} ${options.logs.symbols.error} ${logMsg} ${options.logs.symbols.error},
`
      if (options.logs.typhon) await createTyphonLog({
        host: options.logs.typhonSettings.host !== "" ? options.logs.typhonSettings.host : os.hostname(),
        namespace: options.logs.typhonSettings.namespace,
        name: `${options.fileLocations.outputFolder}.${options.logs.typhonSettings.name}`,
        type: msgType,
        description: logMsg,
        details: anyDetails
      });
      break;
    case "warning":
      updateLogMsg = `${new Date().toLocaleString()} ${options.logs.symbols.warning} ${logMsg} ${options.logs.symbols.warning},
`
      if (options.logs.typhon) await createTyphonLog({
        host: options.logs.typhonSettings.host !== "" ? options.logs.typhonSettings.host : os.hostname(),
        namespace: options.logs.typhonSettings.namespace,
        name: `${options.fileLocations.outputFolder}.${options.logs.typhonSettings.name}`,
        type: msgType,
        description: logMsg,
        details: anyDetails
      });
      break;

    default:
      updateLogMsg = `${new Date().toLocaleString()} ${options.logs.symbols.default} ${logMsg} ${options.logs.symbols.default},
`
      break;
  };



  // CREATE new STREET file with empty array in it
  fs.appendFileSync(logsPath, updateLogMsg, function (err) {
    if (err) {
      return console.log("Error from fs Update Logs: ", err);
    }
    console.log("updated log file");
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create accepted-letters file
*/
const createAcceptedLetters = () => {
  // CREATE new STREET file with empty array in it
  fs.writeFileSync(aLPath, "[]", function (err) {
    if (err) {
      return console.log("Error from fs Create AL: ", err);
    }

    console.log("created a file to store 'accepted-letters' within");
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create accessible-streets file
*/
const createAccessibleStreets = () => {
  // CREATE new STREET file with empty array in it
  fs.writeFileSync(aSPath, "[]", function (err) {
    if (err) {
      return console.log("Error from fs Create AS: ", err);
    }
    console.log("created a file to store 'accessible-streets' within");
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create usable-street-urls file
*/
const createUsableStreetUrls = () => {
  // CREATE new STREET file with empty array in it
  fs.writeFileSync(uSUPath, "[]", function (err) {
    if (err) {
      return console.log("Error from fs Create USU: ", err);
    }
    console.log("created a file to read 'usable-street-urls' from");
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create properties file
*/
const createProperties = () => {
  // CREATE new STREET file with empty array in it
  fs.writeFileSync(pPath, "[]", function (err) {
    if (err) {
      return console.log("Error from fs Create P: ", err);
    }
    console.log("created a file to read/write 'properties' to and from");
  });
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Create property-data file
*/
const createPropertyData = () => {
  // CREATE new STREET file with empty array in it
  fs.writeFileSync(pDPath, "[]", function (err) {
    if (err) {
      return console.log("Error from fs Create PD: ", err);
    }
    console.log("created a file to write the final 'property data' to");
  });
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  saveAcceptedLetters uses child functions to...
  Read from the accepted-letters file.
  Update the contents of the varable.
  Write the updated data back to the file.
*/
async function saveAcceptedLetters(usableUrls) {
  storedLetters(usableUrls);
}

// READ contents of Alpha file, then write to file with more content
const storedLetters = (usableUrls) => {

  const bufferedData = fs.readFileSync(aLPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Save AL: ", err);
    }
    return dataFromFile;
  });

  // converts file to readable content, then converts back to save content (after pushing)
  const parseDataObj = JSON.parse(bufferedData);
  parseDataObj.push(usableUrls);
  const stringData = JSON.stringify(parseDataObj);

  // take off (double) array brackets
  const updatedLetters = stringData.substring(1, stringData.length - 1);

  // write command
  fs.writeFileSync(aLPath, updatedLetters);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  saveExtractedStreets uses child functions to...
  Read from the accessible-streets file.
  Update the contents of the varable.
  Write the updated data back to the file.
*/
async function saveExtractedStreets(streetData) {

  storedStreets(JSON.parse(streetData));
}

// READ contents of STREET file, then write to file with more content
const storedStreets = (extractedStreet) => {

  const bufferedData = fs.readFileSync(aSPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read AS: ", err);
    }
    return dataFromFile;
  });

  // converts file to readable content, then converts back to save content
  const parseDataObj = JSON.parse(bufferedData);
  parseDataObj.push(extractedStreet);
  const stringData = JSON.stringify(parseDataObj);
  const result = stringData.substring(1, stringData.length - 1);

  // write command
  fs.writeFileSync(aSPath, stringData);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read from the usable-street-urls file.
  Update the contents of the varable.
  Write the updated data back to the file.
*/
async function saveUsableStreets(usableStreet) {
  usableStreets(JSON.parse(usableStreet));
}


// READ contents of USABLE STREET file, then write to file with more content
const usableStreets = (usableStreet) => {

  const bufferedData = fs.readFileSync(uSUPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read USU: ", err);
    }
    return dataFromFile;
  });

  // converts file to readable content, then converts back to save content
  const parseDataObj = JSON.parse(bufferedData);
  parseDataObj.push(usableStreet);
  const stringData = JSON.stringify(parseDataObj);
  const result = stringData.substring(1, stringData.length - 1);

  // write command
  fs.writeFileSync(uSUPath, result);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read from the properties file.
  Update the contents of the varable.
  Write the updated data back to the file.
*/
async function saveToProperties(streetData) {
  storedProperties(JSON.parse(streetData));
}

// READ contents of STREET file, then write to file with more content
const storedProperties = (extractedStreet) => {

  const bufferedData = fs.readFileSync(pPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read P: ", err);
    }
    return dataFromFile;
  });

  // converts file to readable content, then converts back to save content
  const parseDataObj = JSON.parse(bufferedData);
  parseDataObj.push(extractedStreet);
  const stringData = JSON.stringify(parseDataObj);
  // const result = stringData.substring(1, stringData.length - 1);

  // write command
  fs.writeFileSync(pPath, stringData);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read from the property-data file.
  Update the contents of the varable.
  Write the updated data back to the file.
*/
async function savePropertyData(propertyData) {
  storedProperty(propertyData);
}

// READ contents of property-data file, then write to file with more content
const storedProperty = (properties) => {

  const bufferedData = fs.readFileSync(pDPath, "utf8", (err, dataFromFile) => {
    if (err) {
      return console.log(err);
    }
    return dataFromFile;
  });

  // converts file to readable content, then converts back to save content

  const parseDataObj = JSON.parse(bufferedData);
  parseDataObj.push(properties);
  // could flatten here, though makes it harder to locate multiple applications from one property
  const stringData = JSON.stringify(parseDataObj);

  // write command
  fs.writeFileSync(pDPath, stringData);

}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read sysLogs (logs.txt) usually used when restarting a process
*/
const readSysLog = () => {
  const bufferedData = fs.readFileSync(logsPath, "utf8", (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read sysLogs: ", err);
    }
    return dataFromFile;
  });
  return bufferedData;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read array from lettersFile
*/
const readAcceptedLetters = () => {
  const bufferedData = fs.readFileSync(aLPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read AL: ", err);
    }
    return dataFromFile;
  });
  return JSON.parse(bufferedData);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read object data from allStreetsFile
*/
const readAccessibleStreets = () => {
  const bufferedData = fs.readFileSync(aSPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read AS: ", err);
    }
    return dataFromFile;
  });
  return JSON.parse(bufferedData);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read url data from usable-street-urls.json
*/
const readUsableStreetUrls = () => {
  const bufferedData = fs.readFileSync(uSUPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read USU: ", err);
    }
    return dataFromFile;
  });
  return JSON.parse(bufferedData);
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Read properties OBJECTS from properties.json
*/
const readProperties = () => {
  const bufferedData = fs.readFileSync(pPath, (err, dataFromFile) => {
    if (err) {
      return console.log("Error from fs Read P: ", err);
    }
    return dataFromFile;
  });
  return JSON.parse(bufferedData);
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Find the source location of the needed file
*/
const fileSrc = (fileToCopy) => {
  switch (fileToCopy) {
    case "properties":
      // returning 'workableStreets' location
      return uSUPath;

    case "property":
      // returning 'propertiesFile' location
      return pPath;

    default:
      break;
  }
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Copy a file with a TEMP ext
*/
const copyFile = (fileSrc) => {

  // create a temp file via replacement file extension
  const tempFileSrc = fileSrc.replace(".json", "-temp.json");

  // destination will be created or overwritten by default.
  fs.copyFileSync(fileSrc, tempFileSrc);

  return tempFileSrc;
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  remove a file
*/
const removeFile = async (fileToRemove) => {
  fs.unlinkSync(fileToRemove, function (err) {
    if (err) {
      return console.log(`Error from fs unLink ${fileToRemove}: `, err);
    }
    sysLogs(`File ${fileToRemove} has been removed`, "warning");
    return console.log("Old file clean-up, OK!");
  })
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  open and read "a" file
*/
const readFromTemp = (fileToRead) => {
  const bufferedData = fs.readFileSync(fileToRead, (err, dataFromFile) => {
    if (err) {
      return console.log(
        `Failed to read from ${fileToRead} file:
${err}`);
    }
    return dataFromFile;
  });
  console.log(`Reading data from ${fileToRead} file`);
  const data = JSON.parse(bufferedData);
  return data;
}


// READ contents of USABLE STREET file, then write to file with more content
const writeToTemp = async (replaceData, fileLocation) => {

  const convertToArray = JSON.stringify(replaceData);
  // write command
  fs.writeFileSync(fileLocation, convertToArray, {
    encoding: "utf8",
    flag: "w"
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


module.exports = {
  readConfig,
  writeConfig,
  folderExist,
  fileExist,
  resetDataFolder,
  createTyphonLog,
  createSysLogs,
  sysLogs,
  createAcceptedLetters,
  createAccessibleStreets,
  createUsableStreetUrls,
  createProperties,
  createPropertyData,
  saveAcceptedLetters,
  saveExtractedStreets,
  saveUsableStreets,
  saveToProperties,
  savePropertyData,
  readSysLog,
  readAcceptedLetters,
  readAccessibleStreets,
  readUsableStreetUrls,
  readProperties,
  fileSrc,
  copyFile,
  removeFile,
  readFromTemp,
  writeToTemp
}