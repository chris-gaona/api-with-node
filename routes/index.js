/** A module. Its name is module:router.
 * @module router
 */

'use strict';
// call modules & assign them to variables
/**
* Requires express npm module
* @requires npm install express
*/
var express = require('express');
var router = express.Router();

// TODO: Comment here
var async = require("async");

var Twitter = require('twitter');
// adds twitter keys from external file
var twitterKeys = require('../../twitter-config.json');

// defines client object for Twitter module
/**
* Twitter API client keys & secrets
* @name client
*/
var client = new Twitter({
  consumer_key: twitterKeys.consumer_key,
  consumer_secret: twitterKeys.consumer_secret,
  access_token_key: twitterKeys.access_token_key,
  access_token_secret: twitterKeys.access_token_secret
});

var parseTwitterDate = require('../utils/parseDate.js');

// define params variable for twitter module
var params = {screen_name: 'chrissgaona', count: 5};

/* GET home page. */
router.get('/', function (req, res, next) {
  async.parallel([
      getUserTimeline,
      getUserFriends,
      getMessagesReceived,
      getMessagesSent
  ], function (err, results) {
    var username = getTimelineInfoTest(results[0]).tweetsObject.screen_name,
    following = getTimelineInfoTest(results[0]).tweetsObject.friends_count,
    tweets = getTimelineInfoTest(results[0]).tweets,
    friends = getFriendsTest(results[1]),
    messagesReceivedArray = getReceivedMessagesTest(results[2]).messagesReceivedArray,
    recipientName = getReceivedMessagesTest(results[2]).recipientName,
    allMessages = getSentMessagesTest(results[3], messagesReceivedArray, recipientName).allMessages,
    recipName = getSentMessagesTest(results[3], messagesReceivedArray, recipientName).recipName,
    profileImage = getTimelineInfoTest(results[0]).profileImage,
    backgroundImage = getTimelineInfoTest(results[0]).backgroundImage;

    res.render('index', {
      username: username,
      following: following,
      tweets: tweets,
      friends: friends,
      messages: allMessages,
      recipient: recipName,
      image: profileImage,
      background: backgroundImage
    });
  });
}); // router.get()

function getUserTimeline(callback) {
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, tweets);
  });
}
function getUserFriends(callback) {
  client.get('friends/list', params, function (error, friends, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, friends);
  });
}
function getMessagesReceived(callback) {
  client.get('direct_messages', params, function (error, messages, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, messages);
  });
}
function getMessagesSent(callback) {
  client.get('direct_messages/sent', params, function (error, messagesSent, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, messagesSent);
  });
}

function getTimelineInfoTest (tweets) {
  // defines needed variables
  var tweetsArray = [];
  var profileImage;
  var backgroundImage;

  var tweetsObject;

  // creates for loop through tweets response from
  // twitter API
  for (var i = 0; i < tweets.length; i++) {
    profileImage = tweets[i].user.profile_image_url_https;
    backgroundImage = tweets[i].user.profile_banner_url;

    // if tweet has been retweeted use the following
    // object
    if (tweets[i].retweeted_status !== undefined) {
      /**
      * Recent 5 tweets of user
      * @name tweets object
      */
      tweetsObject = {
        created_at: parseTwitterDate(tweets[i].created_at, true),
        profile_image: tweets[i].user.profile_image_url_https,
        name: tweets[i].user.name,
        screen_name: tweets[i].user.screen_name,
        text: tweets[i].retweeted_status.text,
        retweet_count: tweets[i].retweeted_status.retweet_count,
        favorite_count: tweets[i].retweeted_status.favorite_count,
        friends_count: tweets[i].user.friends_count
      };

    // else if tweet has NOT been retweeted use
    // the following object
    } else {
      tweetsObject = {
        created_at: parseTwitterDate(tweets[i].created_at, true),
        profile_image: tweets[i].user.profile_image_url_https,
        name: tweets[i].user.name,
        screen_name: tweets[i].user.screen_name,
        text: tweets[i].text,
        retweet_count: tweets[i].retweet_count,
        favorite_count: tweets[i].favorite_count,
        friends_count: tweets[i].user.friends_count
      };
    } // if statement
    // push the object to tweetsArray
    tweetsArray.push(tweetsObject);
  } // for loop

  // console.log(tweetsArray);
  return { tweets: tweetsArray, tweetsObject: tweetsObject, profileImage: profileImage, backgroundImage: backgroundImage };
} // getTimelineInfo()

function getFriendsTest (friends) {
  // define needed variables
  var friendsArray = [];

  // if there is no error...
  var friendsObject;

  // for loop through the friends
  for (var i = 0; i < friends.users.length; i++) {
    /**
    * Recent 5 friends of user on twitter
    * @name friends object
    */
    friendsObject = {
      profile_image: friends.users[i].profile_image_url_https,
      name: friends.users[i].name,
      screen_name: friends.users[i].screen_name
    };
    friendsArray.push(friendsObject);
  }
  return friendsArray;
} // getFriends()

function getReceivedMessagesTest (messages) {
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
} // getReceivedMessages()

function getSentMessagesTest (messages, messagesReceivedArray, recipientName) {
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
} // getSentMessages()




/** Posts new tweet from application to twitter api
* @function
* @param res - response to send to client
* @param {string} statusText - tweet text created by user
*/
function postNewTweet (res, statusText) {
  // sets up tweet from client to be sent to twitter api
  var tweetParams = {status: statusText};
  // uses twitter module to post tweet to twitter
  client.post('statuses/update', tweetParams, function (error, tweet, response) {
    // if there is no error...
    if (!error) {
      // send response to client handled by ajax
      res.json({
        'message': 'Successfully sent tweet!',
        'title': tweet.title
      });
    } else {
      console.log(error);
      // else send error response to client handled by
      // ajax
      res.json({
        'message': 'There was an error!',
        'errorMessage': error
      });
    } // if statement
  }); // client.post
} // postNewTweet()

// post route /tweet to add a new tweet from app page
router.post('/tweet', function (req, res, next) {
  // contains tweet sent from ajax request as data
  var statusText = req.body.tweet;
  postNewTweet(res, statusText);
}); // router.post()

// exports router
module.exports = router;
