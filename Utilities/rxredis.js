var logger = require('./logger')

// Redis related
var redis = require("redis");
var redisClient;

if (process.env['REDISTOGO_URL']) {
	var rtg   = require("url").parse(process.env['REDISTOGO_URL']);
	redisClient = redis.createClient(rtg.port, rtg.hostname);
	redisClient.auth(rtg.auth.split(":")[1]);
} else if (process.env['REDIS_URL']) {
	var rtg   = require("url").parse(process.env['REDIS_URL']);
	redisClient = redis.createClient(rtg.port, rtg.hostname);
} else {
	// fall back to creating redis client locally
    redisClient = redis.createClient();
}

redisClient.debug_mode = true;
var Rx = require('rx');

// Returns an observable for a redis value for a given key
function valueForKey(key){
	// Wrap redisClient.get
	return Rx.Observable.fromNodeCallback(redisClient.get.bind(redisClient))(key);
}

function setValueForKey(key, value, shouldTimeout, timeout){
	// wrap redisClient.set
	var jsonValue = JSON.stringify(value);
	var source = Rx.Observable.fromNodeCallback(redisClient.set.bind(redisClient))(key, jsonValue);	
	if (shouldTimeout)
		redisClient.expire(key, timeout);		
	return source;
}

module.exports.valueForKey = valueForKey;
module.exports.setValueForKey = setValueForKey;