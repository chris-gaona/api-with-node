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
// Twitter module to make Twitter api requests
/**
* Requires twitter npm module to handle request to twitter api
* @requires npm install twitter
*/
var Twitter = require('twitter');
// adds twitter keys from external file
var twitterKeys = require('../../twitter-config.json');

// TODO: Comment here
var async = require("async");

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
* Parses dates from twitter for timeline & direct
* messages
* @function
* @param {string} tdate - Date from twitter api
* @param {boolean} booleanValue - boolean for whether adding
* to timeline or direct messages
* @returns {string} Appropriate string based on the result of the difference
* between twitter api date & user access date
*/
function parseTwitterDate (tdate, booleanValue) {
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
}

// gets /stream-tweets route & handles request & response
// for streaming routes
router.get('/stream-tweets', function (req, res, next) {
  console.log('Running stream!');
  // uses twitter module to stream from twitter api
  client.stream('statuses/filter', { follow: '2252277176' }, function (stream) {
    // on receiving the data do the following
    stream.on('data', function (tweet) {
      res.writeHead(200, {"Content-Type": "application/json"});

      var retweeted = {
        'success': true,
        'name': tweet.user.name,
        'username': tweet.user.screen_name,
        'text': tweet.text,
        'retweet': tweet.retweeted_status.retweet_count,
        'like': tweet.retweeted_status.favorite_count,
        'image': tweet.user.profile_image_url_https,
        'date': parseTwitterDate(tweet.created_at, true)
      };

      var notRetweeted = {
        'success': true,
        'name': tweet.user.name,
        'username': tweet.user.screen_name,
        'text': tweet.text,
        'retweet': tweet.retweet_count,
        'like': tweet.favorite_count,
        'image': tweet.user.profile_image_url_https,
        'date': parseTwitterDate(tweet.created_at, true)
      };
      // if the tweet has been retweeted use this object
      if (tweet.retweeted_status !== undefined) {
        res.write(JSON.stringify(retweeted));
      // else if it's a new tweet use this object
      } else {
        res.write(JSON.stringify(notRetweeted));
      } // if statement
    }); // on data
    // on stream error log the error
    stream.on('error', function (error) {
      console.log(error);
      throw error;
    }); // on error
  }); // client.stream
}); // router.get

// define params variable for twitter module
var params = {screen_name: 'chrissgaona', count: 5};

/* GET home page. */
router.get('/', function (req, res, next) {
  // getTimelineInfo(res);

  async.parallel([
      myFirstFunction,
      mySecondFunction,
      myThirdFunction,
      myFourthFunction
  ], function (err, results) {
      var messagesReceivedArray = getReceivedMessagesTest(results[2]).messagesReceivedArray;
      var recipientName = getReceivedMessagesTest(results[2]).recipientName;
      var allMessages = getSentMessagesTest(results[3], messagesReceivedArray, recipientName).allMessages;
      var recipName = getSentMessagesTest(results[3], messagesReceivedArray, recipientName).recipName;

      res.render('index', {
        username: getTimelineInfoTest(results[0]).tweetsObject.screen_name,
        following: getTimelineInfoTest(results[0]).tweetsObject.friends_count,
        tweets: getTimelineInfoTest(results[0]).tweets,
        friends: getFriendsTest(results[1]),
        messages: allMessages,
        recipient: recipName,
        image: getTimelineInfoTest(results[0]).profileImage,
        background: getTimelineInfoTest(results[0]).backgroundImage
      });
  });
}); // router.get()

function myFirstFunction(callback) {
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, tweets);
  });
}
function mySecondFunction(callback) {
  client.get('friends/list', params, function (error, friends, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, friends);
  });
}
function myThirdFunction(callback) {
  client.get('direct_messages', params, function (error, messages, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, messages);
  });
}
function myFourthFunction(callback) {
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
      console.log(tweet);
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
