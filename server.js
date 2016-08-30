var express = require("express");
var app = express();
var port = process.env.PORT || 3700;
var io = require('socket.io').listen(app.listen(port));
var Instagram = require('instagram-node-lib');
var http = require('http');
var request = ('request');
var intervalID;

/**
 * Set the paths for your files
 * @type {[string]}
 */
var pub = __dirname + '/public',
    view = __dirname + '/views';

/**
 * Set the 'client ID' and the 'client secret' to use on Instagram
 * @type {String}
 */
var clientID = 'c0369456459d4b35a9cc82fa4ce97453',
    clientSecret = 'e11c3adffa80479c9fdf77aff0c54600';

// scope=public_content+follower_list+relationships+likes

/**
 * Set the configuration
 */
Instagram.set('client_id', clientID);
Instagram.set('client_secret', clientSecret);
//Instagram.set('callback_url', 'http://YOUR_URL.com/callback');
Instagram.set('redirect_uri', 'http://YOUR_URL.com');
//Instagram.set('maxSockets', 10); only if i need more

url = Instagram.oauth.authorization_url({
	scope: 'public_content follower_list relationshipss likes' // use a space when specifying a scope; it will be encoded into a plus
	display: 'touch'
    });


/* Sample code to get oauth */
app.get('/oauth', function(request, response){
	Instagram.oauth.ask_for_access_token({
		request: request,
		    response: response,
		    redirect: 'http://your.redirect/url', // optional
		    complete: function(params, response){
		    // params['access_token']
		    // params['user']
		    response.writeHead(200, {'Content-Type': 'text/plain'});
		    // or some other response ended with
		    response.end();
		},
		    error: function(errorMessage, errorObject, caller, response){
		    // errorMessage is the raised error message
		    // errorObject is either the object that caused the issue, or the nearest neighbor
		    // caller is the method in which the error occurred
		    response.writeHead(406, {'Content-Type': 'text/plain'});
		    // or some other response ended with
		    response.end();
		}
	    });
	return null;
    });

function getMedia() {
    Instagram.tags.recent({
	    
	});
}

function evaluateUser(userId) {
    Instagram.users.info({
	    user_id: userId,
		complete: function(data, pagination) {
		// data is a javascript object/array/null matching that shipped Instagram
		// when available (mostly /recent), pagination is a javascript object with the pagination information
		if (verifyUser(data)) {
		    likeMedia(userId, data.counts);
		    followUser(userId, data.counts);
		}
	    },
		error: function(errorMessage, errorObject, caller) {
		// errorMessage is the raised error message
		// errorObject is either the object that caused the issue, or the nearest neighbor
		// caller is the method in which the error occurred
	    }
	});
}

function verifyUser(data) {
    // Put in various filters
    if (data.username contains "spitz") return true;
    if (data.username contains "lier" || "cat") return false;

    return true;
}

function likeMedia(userId, stats) {
    if (stats.media < 15) {
	Instagram.users.recent({
		user_id: userId,
		    complete: function(data, pagination) {

		}
	    });
	// like all media if < 15
    } else {
	Instagram.users.recent({
		user_id: userId,
                    complete: function(data, pagination) {
		    
		}
            });
	// like 5 media
    }
}

function followUser(userId, stats) {
    if (stats.follows < 25 ||
	stats.follows > 7000 ||
	stats.followed_by > 10 * stats.follows ||
	2 * stats.follows < 3 * stats.followed_by)
	return;

    // follow user if not followed already
}

Instagram.tags.recent({name:"dogsofinstagram"});

// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
  io.set("transports", [
    'websocket'
    , 'xhr-polling'
    , 'flashsocket'
    , 'htmlfile'
    , 'jsonp-polling'
  ]);
  io.set("polling duration", 10);
});

/**
 * Set your app main configuration
 */
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.static(view));
    app.use(express.errorHandler());
});

/**
 * Render your index/view "my choice was not use jade"
 */
app.get("/views", function(req, res){
    res.render("index");
});

// check subscriptions
// https://api.instagram.com/v1/subscriptions?client_secret=YOUR_CLIENT_ID&client_id=YOUR_CLIENT_SECRET

/**
 * On socket.io connection we get the most recent posts
 * and send to the client side via socket.emit
 */
io.sockets.on('connection', function (socket) {
  Instagram.tags.recent({
      name: 'lollapalooza',
      complete: function(data) {
        socket.emit('firstShow', { firstShow: data });
      }
  });
});

/**
 * Needed to receive the handshake
 */
app.get('/callback', function(req, res){
    var handshake =  Instagram.subscriptions.handshake(req, res);
});

/**
 * for each new post Instagram send us the data
 */
app.post('/callback', function(req, res) {
    var data = req.body;

    // Grab the hashtag "tag.object_id"
    // concatenate to the url and send as a argument to the client side
    data.forEach(function(tag) {
      var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id='+clientID;
      sendMessage(url);

    });
    res.end();
});

/**
 * Send the url with the hashtag to the client side
 * to do the ajax call based on the url
 * @param  {[string]} url [the url as string with the hashtag]
 */
function sendMessage(url) {
  io.sockets.emit('show', { show: url });
}

console.log("Listening on port " + port);
