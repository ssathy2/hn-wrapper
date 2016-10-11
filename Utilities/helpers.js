var rootUrl = 'https://hacker-news.firebaseio.com';
var version = 'v0'
var request = require('request');
var Rx 		= require('rx');
var logger	= require('./logger')
var rxredis = require('./rxredis')
var get = Rx.Observable.fromNodeCallback(request);

function verifyRequest(fromStory, toStory, res, next){
    if (toStory < fromStory){
		res.send(400, {'error' : 'fromStory cannot be greater than toStory'});
		return false;	
	}
	else
		return true;
}

var fetchStories_helper = function(url, clientRequestUrl, fromCount, toCount, res, next, useCache) { 
	if (!verifyRequest(fromCount, toCount, res, next))
		return;
		
	var storyIds = [];
	var stories = [];

	var startDate = new Date();
	get(url)
	.map(function(res){
		var currentDate = new Date();
		var time = currentDate.getTime() - startDate.getTime();
		logger.info("Took " + time + " msecs to fetch all top stories from " + url);
		return res[1];
	})
	.map(function(res){
		storyIds = JSON.parse(res);
		return storyIds;
	})
	.flatMap(function(res){
		return Rx.Observable.fromArray(res);
	})
	.skip(fromCount)
	.take(toCount - fromCount)
	.flatMap(function(storyID){
		return Rx.Observable.create(function(observer){
			var isFetchingFromServer = false;
			if (useCache) {
				rxredis.valueForKey(storyID)
				.flatMap(function(cachedValue){
				 	if (cachedValue)
					 {
						logger.info('Using cached value for storyID: ' + storyID);
					 	return Rx.Observable.return(cachedValue);
					 }
					else
					{
						logger.info('Grabbing value from server with storyID: ' + storyID);
						isFetchingFromServer = true;						
						return get(hnURL('/item/' + storyID + '.json'));
					}
				})
				.map(function(res){
					if (res[1] && isFetchingFromServer)
					{
						var jsonVal = JSON.parse(res[1]);
						rxredis.setValueForKey(jsonVal.id, jsonVal, true, 60);
						return jsonVal;
					}
					else if (res && !isFetchingFromServer)
						return JSON.parse(res);
					else 
						return res;
				})
				.subscribe(
					function(next){
						observer.onNext(next);	
					},
					function(err){
						observer.onError(err);
					},
					function(){
						observer.onCompleted();
					}
				)
			}
			else {
				logger.info('Grabbing value from server with storyID: ' + storyID);				
				get(hnURL('/item/' + storyID + '.json'))
				.map(function(res){
					return res[1]
				})
				.map(function(res){
					var jsonVal = JSON.parse(res);
					rxredis.setValueForKey(jsonVal.id, jsonVal, true, 60);
					return jsonVal;
				})
				.subscribe(
					function(next){
						observer.onNext(next);	
					},
					function(err){
						observer.onError(err);
					},
					function(){
						observer.onCompleted();
					}
				)
			}
		})
	})
	.subscribe(
		function(next){
			stories[storyIds.indexOf(next.id)] = next;
		},
		function(err){
			logger.error(err);
		},
		function(){
			logger.info('Full stories fetch complete!');
			var currentDate = new Date();
			var time = currentDate.getTime() - startDate.getTime();
			logger.info("Took " + time + "msecs to fetch stories for request url: " + clientRequestUrl);
			res.send(stories.filter(function(arrayValue){
				return arrayValue != null;
			}));
		}
	);
} 

var fetchStories_v2 = function(url, req, res, next, useCache) {
	fetchStories_helper(url, req.url, req.query.from, req.query.to, res, next, useCache)
}

var fetchStories = function(url, req, res, next, useCache) {
	fetchStories_helper(url, req.url, req.query.fromStory, req.query.toStory, res, next, useCache)
};

function hnURL(endPoint){
	return rootUrl + '/' + version + '/' + endPoint;
}

module.exports.hnURL		= hnURL;
module.exports.rxNodeCallback = get;
module.exports.fetchStories = fetchStories;
module.exports.fetchStories_v2 = fetchStories_v2;
