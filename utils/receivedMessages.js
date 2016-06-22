/** A module. Its name is module:router.
 * @module receivedMessages
 */

'use strict';

/**
* Requires parseTwitterDate module
* Function to parse the twitter dates
* @requires parseTwitterDate
*/
var parseTwitterDate = require('./parseDate.js');

/**
* Gets received direct messages for user from Twitter api
* @function getReceivedMessages
* @param {object} messages - messages object sent in response from twitter api
* @returns {object} object containing messages received by the user & the real
*          names of those who sent direct messages to the user
*/

module.exports = function (messages) {
  // defines needed variables
  var messagesReceivedArray = [];
  var recipientName = [];
  var messagesReceivedObject;

  // loop through messages
  for (var i = 0; i < messages.length; i++) {
    var messageDate = messages[i].created_at;

    var recName = messages[i].sender.name;

    // if there are multiple users in direct messages
    // add names of the users but each name only once
    if (recipientName.indexOf(recName) === -1) {
      recipientName.push(messages[i].sender.name);
    }

    // creates messages received object
    /**
    * Recent 5 messages received by user
    * @name direct messages received object
    */
    messagesReceivedObject = {
      recipient: true,
      text: messages[i].text,
      name: messages[i].sender.name,
      picture: messages[i].sender.profile_image_url_https,
      created_at: messages[i].created_at,
      date: parseTwitterDate(messageDate, false)
    };
    // pushes object to array
    messagesReceivedArray.push(messagesReceivedObject);
  } // for loop
  // returns object of messages received by user & real names of those who
  // sent direct messages to the user
  return {
    messagesReceivedArray: messagesReceivedArray,
    recipientName: recipientName
  };
};
