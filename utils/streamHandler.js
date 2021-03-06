/** A module. Its name is module:router.
 * @module streamHandler
 */

'use strict';

/**
* Requires parseTwitterDate module
* Function to parse the twitter dates
* @requires parseTwitterDate
*/
var parseTwitterDate = require('./parseDate.js');

/**
* Uses socket.io to maintain the stream to twitter api for recent user tweets
* emits new tweets to client side to be processed
* @function streamHandler
* @param {stream} stream - stream created through twitter api to get tweets
* @param {socket} io - socket.io listening to the express server
*/
module.exports = function (stream, io) {
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
    // otherwise use this object
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

    // emit tweet object to be handled on the client side
    io.emit('tweet', message);
  }); // on data
  // on stream error log the error
  stream.on('error', function (error) {
    console.log(error);
    throw error;
  }); // on error
};
