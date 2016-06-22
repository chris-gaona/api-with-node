/** A module. Its name is module:router.
 * @module parseDate
 */

'use strict';

/**
* Parses dates from twitter for timeline & direct messages
* @function parseTwitterDate
* @param {string} tdate - Date from twitter api
* @param {boolean} booleanValue - boolean for whether adding
*        to timeline or direct messages
* @returns {string} Appropriate string based on the result of the difference
*        between twitter api date & user access date
*/
module.exports = function (tdate, booleanValue) {
  // parses a string representation of a date, &
  // returns the number of milliseconds since
  // January 1, 1970
  var systemDate = new Date(Date.parse(tdate));
  // gets today's date
  var userDate = new Date();
  // splits tdate string at space into array with
  // each word
  var splitDate = tdate.split(' ');
  // gets difference between twitter date & user date
  // divide the value by 1000 to change milliseconds
  // into seconds
  var diff = Math.floor((userDate - systemDate) / 1000);

  // adds text depending on how many seconds the diff is
  // booleanValue is used to deterime to put text in
  // timeline section or direct messages section
  if (diff <= 1) { return 'just now'; }

  if (diff < 60 && booleanValue === true) { return diff + 's'; }
  if (diff < 60 && booleanValue === false) { return diff + ' seconds ago'; }

  if (diff <= 90 && booleanValue === true) { return '1m'; }
  if (diff <= 90 && booleanValue === false) { return 'one minute ago'; }

  if (diff <= 3540 && booleanValue === true) { return Math.round(diff / 60) + 'm'; }
  if (diff <= 3540 && booleanValue === false) { return Math.round(diff / 60) + ' minutes ago'; }

  if (diff <= 5400 && booleanValue === true) { return '1h'; }
  if (diff <= 5400 && booleanValue === false) { return '1 hour ago'; }

  if (diff <= 86400 && booleanValue === true) { return Math.round(diff / 3600) + 'h'; }
  if (diff <= 86400 && booleanValue === false) { return Math.round(diff / 3600) + ' hours ago'; }

  if (diff <= 129600 && booleanValue === true) { return '1d'; }
  if (diff <= 129600 && booleanValue === false) { return '1 day ago'; }

  if (diff < 604800 && booleanValue === true) { return Math.round(diff / 86400) + 'd'; }
  if (diff < 604800 && booleanValue === false) { return Math.round(diff / 86400) + ' days ago'; }

  if (diff <= 777600 && booleanValue === true) { return '1w'; }
  if (diff <= 777600 && booleanValue === false) { return '1 week ago'; }

  // if none of the above return true show actual date
  return splitDate[1] + ' ' + splitDate[2];
};
