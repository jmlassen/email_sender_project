//#region Global Variables

/**
 * The sheet ID of the log file.
 */
 var LOG_ID = "";

 /**
  * The hex value of the info background color to be used in the logs.
  */
 var INFO_BG_COLOR = "#99ccff";
 
 /**
  * The hex value of the error background color to be used in the logs.
  */
 var ERROR_BG_COLOR = "#ff0000";
 
 /**
  * The hex value of the warning background color to be used in the logs.
  */
 var WARNING_BG_COLOR = "#ffe638";
 
 /**
  * The name of the Log sheet.
  */
 var LS_NAME = "Log";
 
 //#endregion Global Variables
 
 //#region Logger Functions
 
 /**
  * Logs a message to the Time Violations document
  * @param {String} message The message to be logged.
  * @param {String} level The level of the event.
  * @param {String} levelColor The background color to set the level to.
  */
 function log(message, level, levelColor) {
   if (true) {
     logV2(message, level, levelColor);
   }
 
   //Open the doc and get the doc body
   var doc = DocumentApp.openById(LOG_ID);
   var body = doc.getBody();
 
   //If function called without setting level, just appened the message and
   //call it a day.
   if (level === undefined) {
     body.appendParagraph(message);
     return;
   }
 
   //Get the current date
   var date = new Date().toString();
   //Get the current user
   var email = Session.getActiveUser().getEmail();
   //Get a new paragraph.
   var paragraph = body.appendParagraph("");
   //Append the level.
   var text = paragraph.appendText(level + ": [" + date + "] - " + email + " - " + message);
   //Set the level background color.
   text.setBackgroundColor(0, level.length - 1, levelColor);
 }
 
 /**
  * Logs a message to the Log sheet of the Time Violations sheet.
  * @param {String} message The message to be logged.
  * @param {String} level The level of the event.
  * @param {String} levelColor The background color to set the level to.
  */
 function logV2(message, level, levelColor) {
   //Get the spreadsheet.
   var spreadsheet = SpreadsheetApp.openById(LOG_ID);
   //Get the Logging sheet.
   var logSheet = spreadsheet.getSheetByName(LS_NAME);
 
   //If no level is defined, append the message to the last row.
   if (level === undefined) {
     logSheet.appendRow([message]);
     //Get the range of the row we just added.
     var range = logSheet.getRange(logSheet.getLastRow(), 1);
     //Set the background color of the level cell.
     range.clearFormat();
     return;
   }
 
   //Create the values to be logged to the sheet.
   var values = [level, new Date().toString(), Session.getActiveUser().getEmail(), message];
   //Append the values to the row.
   logSheet.appendRow(values);
   
   //Get the range of the row we just added.
   var range = logSheet.getRange(logSheet.getLastRow(), 1);
   //Set the background color of the level cell.
   range.setBackground(levelColor);
 }
 
 /**
  * Logs a message under info.
  * @param {String} message The message to be logged.
  */
 function logInfo(message) {
   logV2(message, "INFO", INFO_BG_COLOR);
 }
 
 /**
  * Logs a message under info, and displays a toast notification to the user.
  * @param {String} message The message to be logged.
  */
 function logInfoWithToast(message) {
   SpreadsheetApp.openById(ID).toast(message, "Info", 15);
   logV2(message, "INFO", INFO_BG_COLOR);
 }
 
 /**
  * Logs a message under warning.
  * @param {String} message The message to be logged.
  */
 function logWarning(message) {
   SpreadsheetApp.getUi().alert("Warning", message, Browser.Buttons.OK);
   logV2(message, "WARNING", WARNING_BG_COLOR);
 }
 
 /**
  * Logs a message under error.
  * @param {String} message The message to be logged.
  */
 function logError(message) {
   logV2(message, "ERROR", ERROR_BG_COLOR);
 }
 
 //#endregion Logger Functions
 