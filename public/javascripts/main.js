$(function () {
  'use strict';

  // function count characters for textarea
  function countChar (val) {
    $('#tweet-char').text(140 - val);
  }

  // on user typing
  $('#tweet-textarea').on('keyup', function () {
    // call countChar to dynamically change counter on
    // textarea
    countChar($(this).val().length);
  });

  var socket = io.connect();
  socket.on('tweet', function (response) {
    console.log(response);
    // create text to prepend as new tweet
    var prependText = '<li><strong class="app--tweet--timestamp">' + response.date + '</strong><a class="app--tweet--author"><div class="app--avatar" style="background-image: url(' + response.image + ')"><img src="' + response.image + '"></div><h4>' + response.name + '</h4> @' + response.username + '</a><p>' + response.text + '</p><ul class="app--tweet--actions circle--list--inline"><li><a class="app--reply"><span class="tooltip">Reply</span><img class="inject-me" src="images/reply.svg"></a></li><li><a class="app--repeat"><span class="tooltip">Retweet</span><img class="inject-me" src="images/retweet.svg"><strong>' + ' ' + response.retweet + '</strong></a></li><li><a class="app--like"><span class="tooltip">Like</span><img class="inject-me" src="images/like.svg"><strong>' + ' ' + response.like + '</strong></a></li></ul></li>';

    // prepend the new tweet
    $('ul.app--tweet--list').prepend(prependText);

    // svg elements to inject
    var mySVGsToInject = document.querySelectorAll('img.inject-me');

    // do the injection
    // uses SVGInjector plugin for this
    SVGInjector(mySVGsToInject);
  });

  // on click of tweet button on app
  $('button.button-primary').on('click', function () {
    // gets user text from textarea
    var tweetText = $('#tweet-textarea').val();

    // uses ajax to post to tweet to the server to handle
    $.ajax({
      type: 'POST',
      url: '/tweet',
      timeout: 2000,
      // tweet sent to the server to handle
      data: {tweet: tweetText},
      // on success
      success: function (response) {
        // if there is a response on the ajax request
        if (response) {
          // log the response
          console.log(response);

          // empty the textarea for user to do another tweet
          $('#tweet-textarea').val('');
        } else {
          console.warn('there was an issue');
        } // if statement
      },
      error: function () {
        // show error message
        console.log('There was an error!');
      } // error function
    }); // end $.ajax

    // Very important line, it disables the page refresh.
    return false;
  });
});
