var express = require("express");
var app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));

app.set('views', __dirname + '/views');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'pug');

app.get('/', function(request, response) {
	response.render('index');
    });

app.get('/medias', function(request, response) {
	getMedias(function(userData) {
		console.log(userData);
		response.render('userCard', userData);
	    });
    });

app.get('/about', function(request, response) {
	response.render('about');
    });

app.get('/privacy', function(request, response) {
	response.render('privacy');
    });

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
    });

/*
var port = process.env.PORT || 3700;
var io = require('socket.io').listen(app.listen(port));
*/

var ig = require('instagram-node').instagram();

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
var clientId = 'c0369456459d4b35a9cc82fa4ce97453',
    clientSecret = 'e11c3adffa80479c9fdf77aff0c54600',
    accessToken = '3801943796.c036945.65eb08f817d5462ab00d3cc24e5a2ce9',
    redirectUri = 'http://powersf.herokuapp.com';

/**
 * Set the configuration
 */
ig.use({ access_token: accessToken });
//ig.use({ client_id: clientId,
//	    client_secret: clientSecret });

function getMedias(cb) {
    ig.tag_media_recent('dogs',
			function(err, medias, pagination, remaining, limit) {
			    console.log("got media");
			    //console.log(medias);
			    getUserMediasStats(medias[0].user.id, cb);
			    //evaluateMedia(medias[0]);
			    //console.log(pagination);
			});
}

function getUserMediasStats(userId, cb) {
    ig.user_media_recent(userId, function(err, medias, pagination, remaining, limit) {
	    if (err) {
                // handle err
                return;
            }

	    ig.user(userId, function(err, result, remaining, limit) {
		    if (err) {
			// handle err
			return;
		    }

		    ig.user_relationship(userId, function(err, relationship, remaining, limit) {
			    if (err) {
				// handle err
				return;
			    }

			    // form userData object
			    var userData = {
				stats: result,
				medias: medias,
				relationship: relationship,
				hash: require('crypto').createHash('md5').update(medias[0].user.username).digest("hex")
			    };
			    cb(userData);
			});
		});
	});
}

function evaluateMedia(media) {
    ig.user(media.user.id, function(err, result, remaining, limit) {
	    if (err) {
		// handle
		return;
	    }

	    console.log("evaluating media");                     
	    if (verifyUser(result)) {                              
		likeUser(result.id, result.counts);
		followUser(result.id, result.counts);
	    }
	});
}

function verifyUser(userData) {
    console.log("verifying user");
    // Put in various filters
    var allStr = userData.username + " " + userData.bio + " " + userData.full_name;
    allStr = allStr.toLowerCase();

    if (allStr.includes("lier") ||
	allStr.includes("cav") ||
	allStr.includes("cat") ||
	allStr.includes("pug") ||
	allStr.includes("boston terrier") ||
	allStr.includes("bull") ||
	allStr.includes("french"))
	return false;

    if (userData.counts.follows < 5) return false;

    if (allStr.includes("spitz")) return true;
    if (allStr.includes("pomeranian")) return true;
    // beagle
    // golden retreiver
    // border collie
    // aussie
    // corgi
    // shiba
    // akita
    // eskie, eskimo
    // samoyedo, sammie

    return true;
}

var LIKE_NEW = 15,
    LIKE_NUM = 5;
function likeUser(userId, stats) {
    console.log("liking user");
    
    ig.user_media_recent(userId, function(err, medias, pagination, remaining, limit) {
	    if (err) {
		// handle err
		return;
	    }

	    if (stats.media < LIKE_NEW) {
		// like all media if < LIKE_NEW
		console.log("liking all media");
		for (var i = 0; i < data.length; i++) {
		    likeMedia(medias[i].id);
		}
	    } else {
		// like LIKE_NUM media
		console.log("liking a few media");
		for (var i = 0; i < LIKE_NUM; i++) {
		    likeMedia(medias[i].id);
		}
	    }
	});
}

function likeMedia(mediaId) {
    // filter by media
    console.log("liking media " + mediaId);
    ig.add_like(mediaId, function(err, remaining, limit) {
	    console.log("like media result");
	    console.log(err);
	    console.log(remaining);
	    console.log(limit);
	});
}

var FOLLOW_NEW = 25,
    FOLLOW_MAX = 7000;
function followUser(userId, stats) {
    if (stats.follows < FOLLOW_NEW ||
	stats.follows > FOLLOW_MAX ||
	stats.followed_by > 10 * stats.follows ||
	2 * stats.follows > 3 * stats.followed_by)
	return;

    ig.user_relationship(userId, function(err, result, remaining, limit) {
	    if (err) {
		// handle err
		return;
	    }

	    console.log("checking relationship");
	    console.log(result);
	    console.log(userId);
	    
	    // No need to follow if following already or other user already follows
	    if (result.outgoing_status == 'follows' ||
		result.incoming_status == 'follows')
		return;

	    console.log("following user " + userId);
	    ig.set_user_relationship(userId, 'follow', function(err, result, remaining, limit) {
		    console.log("follow user result");
		    console.log(err);
		    console.log(result);
		});
	});
}

//getMedias();