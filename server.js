var express = require("express");
var app = express();
app.set('port', process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.render('index.html');
    });

app.get('/privacy', function(request, response) {
	response.render('privacy.html');
    });

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
    });

/*
var port = process.env.PORT || 3700;
var io = require('socket.io').listen(app.listen(port));
*/
var Instagram = require('instagram-node-lib');
/*
var http = require('http');
var request = ('request');
var intervalID;
*/

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
    clientSecret = 'e11c3adffa80479c9fdf77aff0c54600',
    accessToken = '3801943796.c036945.65eb08f817d5462ab00d3cc24e5a2ce9';

/**
 * Set the configuration
 */
Instagram.set('client_id', clientID);
Instagram.set('client_secret', clientSecret);
//Instagram.set('callback_url', 'http://YOUR_URL.com/callback');
Instagram.set('redirect_uri', 'http://YOUR_URL.com');
//Instagram.set('maxSockets', 10); only if i need more
Instagram.set('access_token', accessToken);

/*
url = Instagram.oauth.authorization_url({
	scope: 'public_content follower_list relationshipss likes' // use a space when specifying a scope; it will be encoded into a plus
	display: 'touch'
    });


/* Sample code to get oauth *
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
*/

function getMedia() {
    Instagram.tags.recent({
	    name: 'dogsofinstagram',
		complete: function(data, pagination) {
		console.log("got media");
		evaluateMedia(data[0]);
		    //console.log(pagination);
	    }
	});
}

function evaluateMedia(media) {
    Instagram.users.info({
	    user_id: media.user.id,
		complete: function(data, pagination) {
		console.log("evaluating media");
		if (verifyUser(data)) {
		    likeUser(media.user.id, data.counts);
		    followUser(media.user.id, data.counts);
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
    console.log("verifying user");
    // Put in various filters
    var allStr = data.username + " " + data.bio + " " + data.full_name;
    allStr = allStr.toLowerCase();

    if (allStr.includes("lier") ||
	allStr.includes("cav") ||
	allStr.includes("cat") ||
	allStr.includes("pug") ||
	allStr.includes("boston terrier") ||
	allStr.includes("bull") ||
	allStr.includes("french"))
	return false;

    if (data.counts.follows == 0) return false;

    if (allStr.includes("spitz")) return true;

    return true;
}

var LIKE_NEW = 15,
    LIKE_NUM = 5;
function likeUser(userId, stats) {
    console.log("liking user");
    if (stats.media < LIKE_NEW) {
	// like all media if < LIKE_NEW
	console.log("liking all media");
	Instagram.users.recent({
		user_id: userId,
		    complete: function(data, pagination) {
		    for (var i = 0; i < data.length; i++) {
			likeMedia(data[i]);
		    }
		}
	    });
    } else {
	// like LIKE_NUM media
	console.log("liking a few media");
	Instagram.users.recent({
		user_id: userId,
                    complete: function(data, pagination) {
		    for (var i = 0; i < LIKE_NUM; i++) {
                        likeMedia(data[i]);
                    }
		}
            });
    }
}

function likeMedia(media) {
    // filter by media
    console.log("liking media " + media.id);
    //Instagram.media.like({ media_id: media.id });
}

var FOLLOW_NEW = 25,
    FOLLOW_MAX = 7000;
function followUser(userId, stats) {
    if (stats.follows < 25 ||
	stats.follows > 7000 ||
	stats.followed_by > 10 * stats.follows ||
	2 * stats.follows > 3 * stats.followed_by)
	return;


    Instagram.users.relationship({
	    user_id: userId,
		complete: function(data) {
		console.log("checking relationship");
		console.log(data);
		console.log(userId);
		// No need to follow if following already or other user already follows
		if (data.outgoing_status == 'follows' ||
		    data.incoming_status == 'follows')
		    return;

		console.log("following user " + userId);
		//Instagram.users.follow(userId);
	    }
	});
    // follow user if not followed already
}

getMedia();

/*

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


/*
/**
 * Set your app main configuration
 *
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.static(view));
    app.use(express.errorHandler());
});

// check subscriptions
// https://api.instagram.com/v1/subscriptions?client_secret=YOUR_CLIENT_ID&client_id=YOUR_CLIENT_SECRET

/**
 * Needed to receive the handshake
 *
app.get('/callback', function(req, res){
    var handshake =  Instagram.subscriptions.handshake(req, res);
});

/**
 * for each new post Instagram send us the data
 *
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

console.log("Listening on port " + port);
*/