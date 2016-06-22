'use strict';

var parseTwitterDate = require('./parseDate.js');

module.exports = function(messages, messagesReceivedArray, recipientName) {
  // defines needed variables
  var messagesSentArray = [];
  var allMessages;
  var messagesSentObject;

  // loop through messages
  for (var i = 0; i < messages.length; i++) {
    var messageDate = messages[i].created_at;

    // adds to messagesSentObject
    /**
    * Recent 5 direct messages sent by user
    * @name direct messages sent object
    */
    messagesSentObject = {
      recipient: false,
      text: messages[i].text,
      name: messages[i].sender.name,
      picture: messages[i].sender.profile_image_url_https,
      created_at: messages[i].created_at,
      date: parseTwitterDate(messageDate, false)
    };
    // pushes object into array
    messagesSentArray.push(messagesSentObject);
  } // for loop

  // adds both received & sent messages into one array
  allMessages = messagesReceivedArray.concat(messagesSentArray);

  // sorts the array by date to get them in the
  // correct order
  /**
  * Sorts sent & received direct messages by date
  * @function
  * @param {string} a - date
  * @param {string} b - date
  * @returns {array} Sorted array of all direct messages
  */
  allMessages.sort(function (a, b) {
    var keyA = new Date(a.created_at);
    var keyB = new Date(b.created_at);
    // Compare the 2 dates
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });

  var recipName;

  // adds if statement to change string depending on
  // how many users are a in direct messages section
  // can handle up to 4 separate users
  if (recipientName.length === 1) {
    recipName = recipientName[0];
  } else if (recipientName.length === 2) {
    recipName = recipientName[0] + ', ' + recipientName[1];
  } else if (recipientName.length === 3) {
    recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2];
  } else if (recipientName.length === 4) {
    recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2] + ', ' + recipientName[3];
  } // if statement

  return { allMessages: allMessages, recipName: recipName };
};
