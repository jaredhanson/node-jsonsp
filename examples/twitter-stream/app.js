var https = require('https');
var jsonsp = require('jsonsp');
var util = require('util');
var argv = require('optimist').argv;

// usage: node app.js -U <username> -P <password>

console.log('JSONSP: Twitter Stream Example');
console.log('  (using JSONSP + ' + jsonsp.version + ')');


// Intialize a new JSON stream parser.
//   Listen for the 'object' event, which is emitted whenever a complete JSON
//   object is parsed from the stream.  In this example, each object is a tweet
//   from the Twitter Streaming API.

var parser = new jsonsp.Parser()
parser.on('object', function(tweet) {
  if (tweet.user && tweet.text) {
    console.log('@' + tweet.user.screen_name + ': ' + tweet.text);
  }
});


// Connect and authenticate with the Twitter Streaming API.

function credentials(username, password) {
  return "Basic " + new Buffer(username + ":" + password).toString('base64');
};

var headers = {};
headers['Authorization'] = credentials(argv.U, argv.P);

var options = {
  host: 'stream.twitter.com',
  port: 443,
  path: '/1/statuses/sample.json',
  method: 'GET',
  headers: headers
};

var req = https.request(options, function(res) {
  // Feed each chunk of data incrementally to the JSON stream parser.  For each
  // complete JSON object parsed, an 'object' event will be emitted.
  res.on('data', function(chunk) {
    parser.parse(chunk.toString('utf8'));
  });
});
req.end();
