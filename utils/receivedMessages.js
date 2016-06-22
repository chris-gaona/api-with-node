'use strict';

var parseTwitterDate = require('./parseDate.js');

module.exports = function(messages) {
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
  return { messagesReceivedArray: messagesReceivedArray, recipientName: recipientName };
};
