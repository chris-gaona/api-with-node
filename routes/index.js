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

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index');

  var params = {screen_name: 'chrissgaona', count: 5};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    var tweetsArray = [];
    var username;

    if (!error) {
      // console.log(tweets);
      // res.send(tweets);
      var tweetsObject;
      for (var i = 0; i < tweets.length; i++) {
        var date = tweets[i].created_at.split(' ');
        // console.log(date);

        if (tweets[i].retweeted_status !== undefined) {
        tweetsObject = {
          created_at: date[1] + ' ' + date[2],
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
          created_at: date[1] + ' ' + date[2],
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

      getFriends(tweetsObject, tweetsArray);

      // console.log(tweetsArray);
    } else {
      console.log(error);
    }
  });

  function getFriends(tweetsObject, tweetsArray) {
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

        getReceivedMessages(tweetsObject, tweetsArray, friendsArray);
      } else {
        console.log(error);
      }
      // console.log('Following: ' + tweetsObject.friends_count);

      // res.render('index', {
      //   username: tweetsObject.screen_name,
      //   following: tweetsObject.friends_count,
      //   tweets: tweetsArray,
      //   friends: friendsArray
      // });
    });
  }

  function getReceivedMessages(tweetsObject, tweetsArray, friendsArray) {
    client.get('direct_messages', params, function(error, messages, response){
      var messagesReceivedArray = [];

      if (!error) {
        var messagesReceivedObject;
        // console.log(messages);

        for (var i = 0; i < messages.length; i++) {
          var date = messages[i].created_at.split(' ');

          messagesReceivedObject = {
            recipient: true,
            text: messages[i].text,
            name: messages[i].sender.name,
            created_at: messages[i].created_at,
            date: date[1] + ' ' + date[2]
          };
          messagesReceivedArray.push(messagesReceivedObject);
        }
        // console.log(messagesReceivedArray);

        getSentMessages(tweetsObject, tweetsArray, friendsArray, messagesReceivedArray);

      } else {
        console.log(error);
      }
    });
  }

  function getSentMessages(tweetsObject, tweetsArray, friendsArray, messagesReceivedArray) {
    client.get('direct_messages/sent', params, function(error, messages, response){

      var messagesSentArray = [];

      var allMessages;
      if (!error) {
        var messagesSentObject;

        // console.log(messages);
        // allMessages = receivedMessages.concat(messages);

        for (var i = 0; i < messages.length; i++) {
          var date = messages[i].created_at.split(' ');

          messagesSentObject = {
            recipient: false,
            text: messages[i].text,
            name: messages[i].sender.name,
            created_at: messages[i].created_at,
            date: date[1] + ' ' + date[2]
          };
          messagesSentArray.push(messagesSentObject);
        }

        allMessages = messagesReceivedArray.concat(messagesSentArray);

        allMessages.sort(function(a, b){
          var keyA = new Date(a.created_at),
              keyB = new Date(b.created_at);
          // Compare the 2 dates
          if(keyA < keyB) return -1;
          if(keyA > keyB) return 1;
          return 0;
      });

        console.log(allMessages);

      } else {
        console.log(error);
      }

      res.render('index', {
        username: tweetsObject.screen_name,
        following: tweetsObject.friends_count,
        tweets: tweetsArray,
        friends: friendsArray,
        messages: allMessages
      });
    });
  }

});

module.exports = router;
