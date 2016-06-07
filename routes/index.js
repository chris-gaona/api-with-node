var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var twitterKeys = require('../../twitter-config.json');

var client = new Twitter({
  consumer_key: twitterKeys.consumer_key,
  consumer_secret: twitterKeys.consumer_secret,
  access_token_key: twitterKeys.access_token_key,
  access_token_secret: twitterKeys.access_token_secret
});

(function() {
  'use strict';

  function parseTwitterDate(tdate) {
    var system_date = new Date(Date.parse(tdate));
    var user_date = new Date();
    var splitDate = tdate.split(' ');

    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return "just now";}
    if (diff < 60) {return diff + "s";}
    // if (diff < 40) {return "half a minute ago";}
    // if (diff < 60) {return "less than a minute ago";}
    if (diff <= 90) {return "1m";}
    if (diff <= 3540) {return Math.round(diff / 60) + "m";}
    if (diff <= 5400) {return "1h";}
    if (diff <= 86400) {return Math.round(diff / 3600) + "h";}
    if (diff <= 129600) {return "1d";}
    if (diff < 604800) {return Math.round(diff / 86400) + "d";}
    if (diff <= 777600) {return "1w";}
    return splitDate[1] + ' ' + splitDate[2];
  }

  function parseTwitterDateMessages(tdate) {
    var system_date = new Date(Date.parse(tdate));
    var user_date = new Date();
    var splitDate = tdate.split(' ');

    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return "just now";}
    if (diff < 60) {return diff + " seconds ago";}
    // if (diff < 40) {return "half a minute ago";}
    // if (diff < 60) {return "less than a minute ago";}
    if (diff <= 90) {return "one minute ago";}
    if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
    if (diff <= 5400) {return "1 hour ago";}
    if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
    if (diff <= 129600) {return "1 day ago";}
    if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
    if (diff <= 777600) {return "1 week ago";}
    return splitDate[1] + ' ' + splitDate[2];
  }

  /* GET home page. */
  router.get('/', function(req, res, next) {
    // res.render('index');
    var params = {screen_name: 'chrissgaona', count: 5};

    getTimelineInfo();

    function getTimelineInfo() {
      client.get('statuses/user_timeline', params, function(error, tweets, response) {
        var tweetsArray = [];
        var username;
        var profileImage;
        var backgroundImage;

        console.log(tweets);

        if (!error) {

          var todayDate = new Date();

          var tweetsObject;

          for (var i = 0; i < tweets.length; i++) {
            var splitDate = tweets[i].created_at.split(' ');
            var date = new Date(tweets[i].created_at);
            var getDate;
            profileImage = tweets[i].user.profile_image_url_https;
            backgroundImage = tweets[i].user.profile_banner_url;

            if (tweets[i].retweeted_status !== undefined) {
            tweetsObject = {
              created_at: parseTwitterDate(tweets[i].created_at),
              profile_image: tweets[i].user.profile_image_url_https,
              name: tweets[i].user.name,
              screen_name: tweets[i].user.screen_name,
              text: tweets[i].retweeted_status.text,
              retweet_count: tweets[i].retweeted_status.retweet_count,
              favorite_count: tweets[i].retweeted_status.favorite_count,
              friends_count: tweets[i].user.friends_count
            };
          } else {
            tweetsObject = {
              created_at: parseTwitterDate(tweets[i].created_at),
              profile_image: tweets[i].user.profile_image_url_https,
              name: tweets[i].user.name,
              screen_name: tweets[i].user.screen_name,
              text: tweets[i].text,
              retweet_count: tweets[i].retweet_count,
              favorite_count: tweets[i].favorite_count,
              friends_count: tweets[i].user.friends_count
            };
          }
            tweetsArray.push(tweetsObject);
          }

          getFriends(tweetsObject, tweetsArray, profileImage, backgroundImage);

        } else {
          console.log(error);
        }
      });
    } // getTimelineInfo()

    function getFriends(tweetsObject, tweetsArray, profileImage, backgroundImage) {
      client.get('friends/list', params, function(error, friends, response) {
        var friendsArray = [];

        if (!error) {
          var friendsObject;
          // console.log(friends);

          for (var i = 0; i < friends.users.length; i++) {
            friendsObject = {
              profile_image: friends.users[i].profile_image_url_https,
              name: friends.users[i].name,
              screen_name: friends.users[i].screen_name
            };
            friendsArray.push(friendsObject);
          }
          // console.log(friendsArray);

          getReceivedMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray);
        } else {
          console.log(error);
        }
      });
    } //getFriends()

    function getReceivedMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray) {
      client.get('direct_messages', params, function(error, messages, response){
        var messagesReceivedArray = [];
        var recipientName = [];

        if (!error) {
          var messagesReceivedObject;

          for (var i = 0; i < messages.length; i++) {
            var date = messages[i].created_at.split(' ');
            var messageDate = messages[i].created_at;

            var recName = messages[i].sender.name;

            if (recipientName.indexOf(recName) === -1) {
              recipientName.push(messages[i].sender.name);
            } else {
              console.log('Already there!');
            }

            messagesReceivedObject = {
              recipient: true,
              text: messages[i].text,
              name: messages[i].sender.name,
              picture: messages[i].sender.profile_image_url_https,
              created_at: messages[i].created_at,
              date: parseTwitterDateMessages(messageDate)
            };
            messagesReceivedArray.push(messagesReceivedObject);
          }

          getSentMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray, messagesReceivedArray, recipientName);

        } else {
          console.log(error);
        }
      });
    } //getReceivedMessages()

    function getSentMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray, messagesReceivedArray, recipientName) {
      client.get('direct_messages/sent', params, function(error, messages, response){

        var messagesSentArray = [];
        var allMessages;

        if (!error) {
          var messagesSentObject;

          for (var i = 0; i < messages.length; i++) {
            var date = messages[i].created_at.split(' ');
            var messageDate = messages[i].created_at;

            messagesSentObject = {
              recipient: false,
              text: messages[i].text,
              name: messages[i].sender.name,
              picture: messages[i].sender.profile_image_url_https,
              created_at: messages[i].created_at,
              date: parseTwitterDateMessages(messageDate)
            };
            messagesSentArray.push(messagesSentObject);
          }

          allMessages = messagesReceivedArray.concat(messagesSentArray);

          allMessages.sort(function(a, b){
            var keyA = new Date(a.created_at),
                keyB = new Date(b.created_at);
            // Compare the 2 dates
            if(keyA < keyB) return 1;
            if(keyA > keyB) return -1;
            return 0;
        });

        } else {
          console.log(error);
        }

        var recipName;

        if (recipientName.length === 1) {
          recipName = recipientName[0];
        } else if (recipientName.length === 2) {
          recipName = recipientName[0] + ', ' + recipientName[1];
        } else if (recipientName.length === 3) {
          recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2];
        } else if (recipientName.length === 4) {
          recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2] + ', ' + recipientName[3];
        }

        res.render('index', {
          username: tweetsObject.screen_name,
          following: tweetsObject.friends_count,
          tweets: tweetsArray,
          friends: friendsArray,
          messages: allMessages,
          recipient: recipName,
          image: profileImage,
          background: backgroundImage
        });
      });
    } // getSentMessages()

    function postNewTweet() {
      var tweetParams = {status: ''};
      client.post('statuses/update', tweetParams, function(error, tweetParams, response){
        if (!error) {
          console.log(tweets);
        }
      });
    }

  }); // router.get()
})(); // wrapper function to remove global variables

module.exports = router;
