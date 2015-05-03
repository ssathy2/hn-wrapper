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

var Rx = require('rx');

// Returns an observable for a redis value for a given key
function valueForKey(key){
	return Rx.Observable.create(function(observer){
		redisClient.get(key, function(err, reply){
			if (err)
				observer.error(err);
			else {
				var jsonReply = JSON.parse(reply)
				observer.onNext(jsonReply);
				observer.onCompleted();
			}
		})	
	})
}

// Returns an observable that retuns the value once it's been set in redis with a timeout value
function setValueForKey(key, value, shouldTimeout, timeout){
	return Rx.Observable.create(function(observer){
		var jsonValue = JSON.stringify(value);
		if (shouldTimeout)
			redisClient.expire(key, timeout)
		redisClient.set(key, jsonValue, function(error){
			if (error)
				observer.error(error)
			else {
				observer.onNext(value);
				observer.onCompleted();
			}

		});
	})
}

module.exports.valueForKey = valueForKey;
module.exports.setValueForKey = setValueForKey;