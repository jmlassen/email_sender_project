//#region Global Variables

/**
 * Spreadsheet ID
 */
var SPREADSHEET_ID = "";
 
/**
 * Lesson Schedule Sheet Name
 */
var LESSON_SCHEDULE_SHEET_NAME = "Lesson Schedule";

/**
 * Email Calculator Sheet Name
 */
var EMAIL_SHEET_NAME = "Email Calculator";

/**
 * Milliseconds Per Day
 */
var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The Message
 */
var MESSAGE = "";

/**
 * The Week Message Subject
 */
var WEEK_MESSAGE_SUBJECT = "";

/**
 * The Day Message Subject
 */
var DAY_MESSAGE_SUBJECT = "";

/**
 * Email Message From Name
 */
var EMAIL_MESSAGE_NAME = "";

/**
 * Body Message
 */
var BODY_MESSAGE = "";

//#endregion Global Variables

/**
 * SEND EMAILS
 * Function that is called on the daily timer. Checks if we need to send emails
 * today, then gets the email list and sends the email.
 */
function sendEmails() {
   // Get the current datetime.
   var currentTime = new Date();
   
   // Get next lessson date
   var nextLesson = getNextLesson(currentTime);
   
   // Check to see if we even need to send an email.
   if (nextLesson === null) return;
   
   // Get the emails.
   var emails = getSheetValues(EMAIL_SHEET_NAME);
   
   if (nextLesson.daysUntilNext === 6) {
      sendWeekEmail(nextLesson.lesson, emails);
   } else {
      sendDayEmail(nextLesson.lesson, emails);
   }
}

function getNextLesson(currentTime) {
   // Get the lesson schedule
   var lessonSchedule = getSheetValues(LESSON_SCHEDULE_SHEET_NAME);
   // Determine the next lesson date
   var nextLessonDateIndex = getNextLessonDate(lessonSchedule, currentTime);
   
   // Calculate days until nextLessonDate.
   var daysUntilNextLesson = daysBetween(
      currentTime, lessonSchedule[nextLessonDateIndex][3]);
   if (daysUntilNextLesson === 1 || daysUntilNextLesson === 6) {
      return { 
         daysUntilNext: daysUntilNextLesson, 
         lesson: lessonSchedule[nextLessonDateIndex] 
      };
   }
   
   return null;
}

function getSheetValues(sheetName) {
   // Get the spreadsheet.
   var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
   
   // Get the Lesson Schedule Sheet.
   var sheet = spreadsheet.getSheetByName(sheetName);
   
   // Calculate range values
   var numRows = sheet.getLastRow() - 2;
   var numColumns = sheet.getLastColumn();
   
   // Return back a 2D array with the range values.
   return sheet.getSheetValues(2, 1, numRows, numColumns);
}

function getNextLessonDate(lessonSchedule, currentTime) {
   // Sort schedule by the Lesson Date.
   lessonSchedule.sort(function(a, b) {
      return a[3].getTime() - b[3].getTime();
   });
   
   // Loop through the lessons to determine the next date later than 'today'
   for (var i = 0; i < lessonSchedule.length; i++) {
      if (currentTime < lessonSchedule[i][3]) {
         return i;
      }
   }

   // If we get here, there is no next lesson date.
   throw "Not able to determine nextLessonDate";
}

function treatAsUTC(date) {
   var result = new Date(date);
   result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
   return result;
}

function daysBetween(startDate, endDate) {
   var result = (treatAsUTC(endDate) - treatAsUTC(startDate)) / MILLISECONDS_PER_DAY;
   return Math.ceil(result);
}

function sendWeekEmail(lesson, emails) {
   sendEmail(WEEK_MESSAGE_SUBJECT, lesson, emails);
}

function sendDayEmail(lesson, emails) {
   sendEmail(DAY_MESSAGE_SUBJECT, lesson, emails);
}

function sendEmail(subject, lesson, emails) {
   var msgHtml = getBody(lesson);
   var msgPlain = msgHtml.replace(/\<br\/\>/gi, '\n').replace(/(<([^>]+)>)/ig, "");
  
   var ccEmails = getEmailString(emails, "CC");
   
   var bccEmails = getEmailString(emails, "BCC");

   // TODO: Temp workaround to be able to send emails... can only send a an email to a 
   // max of 50 recipients at a time
   var split = getSplitBccEmails(bccEmails);
   
   // TODO: figure out better workaround system
   // Send first batch of emails
   GmailApp.sendEmail("", subject, msgPlain, {
      bcc: split.emails1,
      cc: ccEmails,
      htmlBody: msgHtml,
      name: EMAIL_MESSAGE_NAME
   });
   
   // Send second batch of emails
   GmailApp.sendEmail("", subject, msgPlain, {
      bcc: split.emails2,
      cc: ccEmails,
      htmlBody: msgHtml,
      name: EMAIL_MESSAGE_NAME
   });
}

function getBody(lesson) {
  //Log
  logInfo("Toast");
   var dateStr = formatDate(lesson[3]);
   
   return BODY_MESSAGE;
}

function formatDate(date) {
   return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}

function getEmailString(emails, filter) {
   var includedEmails = [];
   
   for (var i = 0; i < emails.length; i++) {
      if (emails[i][3] === filter && emails[i][2]) {
         includedEmails.push(emails[i][2]);
      }
   }
   
   // TODO: Temp workaround
   if (filter === "BCC") {
      return includedEmails;
   }
   
   return includedEmails.join();
}

function getSplitBccEmails(bccEmails) {
   var emails1 = [];
   var emails2 = [];
   
   for (var i = 0; i < bccEmails.length; i++) {
      if (bccEmails[i][2]) {
         if (i % 2 === 0) {
            emails1.push(bccEmails[i]);
         } else {
            emails2.push(bccEmails[i]);
         }
      }
   }
   
   return {
      emails1: emails1.join(),
      emails2: emails2.join()
   };
}

