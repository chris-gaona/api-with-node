/** A module. Its name is module:router.
 * @module router
 */

'use strict';
// calls modules & assign them to variables

/**
* Requires express npm module
* @requires express
*/
var express = require('express');
// creates express router
var router = express.Router();

/**
* Requires async npm module
* @requires async
*/
var async = require('async');

/**
* Requires twitter npm module
* @requires twitter
*/
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

/**
* Requires getTimelineInfo module
* user tweet feed
* @requires getTimelineInfo
*/
var getTimelineInfo = require('../utils/timelineInfo.js');
/**
* Requires getfriendsInfo module
* user friends info
* @requires getfriendsInfo
*/
var getfriendsInfo = require('../utils/friendsInfo.js');
/**
* Requires getReceivedMessages module
* direct messages received by user
* @requires getReceivedMessages
*/
var getReceivedMessages = require('../utils/receivedMessages.js');
/**
* Requires getSentMessages module
* direct messages sent by user
* @requires getSentMessages
*/
var getSentMessages = require('../utils/sentMessages.js');

// define params variable for twitter module
var params = {screen_name: 'chrissgaona', count: 5};

/* GET home page. */
router.get('/', function (req, res, next) {
  // async.parallel method to call the following methods using asynchronous control flow
  async.parallel([
    getUserTimeline,
    getUserFriends,
    getMessagesReceived,
    getMessagesSent
  //  results are passed to the final callback as an array
  ], function (err, results) {
    if (!err) {
      var username = getTimelineInfo(results[0]).tweetsObject.screen_name;
      var following = getTimelineInfo(results[0]).tweetsObject.friends_count;
      var tweets = getTimelineInfo(results[0]).tweets;
      var friends = getfriendsInfo(results[1]);
      var messagesReceivedArray = getReceivedMessages(results[2]).messagesReceivedArray;
      var recipientName = getReceivedMessages(results[2]).recipientName;
      var allMessages = getSentMessages(results[3], messagesReceivedArray, recipientName).allMessages;
      var recipName = getSentMessages(results[3], messagesReceivedArray, recipientName).recipName;
      var profileImage = getTimelineInfo(results[0]).profileImage;
      var backgroundImage = getTimelineInfo(results[0]).backgroundImage;

      // render in the jade template
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
    } else {
      console.log(err);
      next(err);
    }
  });
}); // router.get()

/**
* Gets recent tweets from user timeline
* @function getUserTimeline
* @param callback - adds tweets to first part [0] of results array
*/
function getUserTimeline (callback) {
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (error) { console.log(error); callback(true); }
    callback(null, tweets);
  });
}
/**
* Gets recent friends user is following
* @function getUserFriends
* @param callback - adds tweets to second part [1] of results array
*/
function getUserFriends (callback) {
  client.get('friends/list', params, function (error, friends, response) {
    if (error) { console.log(error); callback(true); }
    callback(null, friends);
  });
}
/**
* Gets direct messages received by user
* @function getMessagesReceived
* @param callback - adds tweets to third part [2] of results array
*/
function getMessagesReceived (callback) {
  client.get('direct_messages', params, function (error, messages, response) {
    if (error) { console.log(error); callback(true); return; }
    callback(null, messages);
  });
}
/**
* Gets direct messages sent by user
* @function getMessagesSent
* @param callback - adds tweets to fourth part [3] of results array
*/
function getMessagesSent (callback) {
  client.get('direct_messages/sent', params, function (error, messagesSent, response) {
    if (error) { console.log(error); callback(true); return; }
    callback(null, messagesSent);
  });
}

/**
* Posts new tweet from application to twitter api
* @function postNewTweet
* @param res - response to send to client
* @param {string} statusText - tweet text created by user
*/
function postNewTweet (res, next, statusText) {
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
      next(error);
    } // if statement
  }); // client.post
} // postNewTweet()

// post route /tweet to add a new tweet from app page
router.post('/tweet', function (req, res, next) {
  // contains tweet sent from ajax request as data
  var statusText = req.body.tweet;
  // calls postNewTweet function
  postNewTweet(res, next, statusText);
}); // router.post()

// exports router
module.exports = router;
