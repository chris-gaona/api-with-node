'use strict';

var parseTwitterDate = require('./parseDate.js');

module.exports = function(stream, io) {
  stream.on('data', function (tweet) {
    var message;
    // Construct a new tweet object
    // if the tweet has been retweeted use this object
    if (tweet.retweeted_status !== undefined) {
      message = {
        success: true,
        name: tweet.user.name,
        username: tweet.user.screen_name,
        text: tweet.text,
        retweet: tweet.retweeted_status.retweet_count,
        like: tweet.retweeted_status.favorite_count,
        image: tweet.user.profile_image_url_https,
        date: parseTwitterDate(tweet.created_at, true)
      };
    } else {
      message = {
        success: true,
        name: tweet.user.name,
        username: tweet.user.screen_name,
        text: tweet.text,
        retweet: tweet.retweet_count,
        like: tweet.favorite_count,
        image: tweet.user.profile_image_url_https,
        date: parseTwitterDate(tweet.created_at, true)
      };
    }

    io.emit('tweet', message);
  }); // on data
  // on stream error log the error
  stream.on('error', function (error) {
    console.log(error);
    throw error;
  }); // on error
};
