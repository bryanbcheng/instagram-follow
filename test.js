Instagram = require('instagram-node-lib');

var clientID = 'c0369456459d4b35a9cc82fa4ce97453',
    clientSecret = 'e11c3adffa80479c9fdf77aff0c54600',
    accessToken = '3801943796.c036945.65eb08f817d5462ab00d3cc24e5a2ce9';

Instagram.set('client_id', clientID);
Instagram.set('client_secret', clientSecret);
Instagram.set('access_token', accessToken);

Instagram.tags.info({
	name: 'blue',
	    complete: function(data){
	    console.log(data);
	}
    });