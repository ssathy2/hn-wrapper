var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var request = require('request');
var Rx 		= require('rx');
var logger	= require('./logger')
var rxredis = require('./rxredis')
var get = Rx.Observable.fromNodeCallback(request);

function verifyRequest(req, res, next){
	var fromStory = req.query.fromStory;
	var toStory	= req.query.toStory;
	
	if (toStory < fromStory){
		res.send(400, {'error' : 'fromStory cannot be greater than toStory'});
		return false;	
	}
	else
		return true;
}

// TODO: IMPLEMENT CACHING
var fetchStories = function(url, req, res, next, useCache) {
	var storyIds = [];
	var stories = [];

	var fromStory = (req.query.fromStory) ? req.query.fromStory : 0;
	var toStory = (req.query.toStory) ? req.query.toStory : 100;

	if (!verifyRequest(req, res, next))
		return;

	var currentStoryId;

	get(url)
	.map(function(res){
		return res[1];
	})
	.map(function(res){
		storyIds = JSON.parse(res);
		return storyIds;
	})
	.flatMap(function(res){
		return Rx.Observable.fromArray(res);
	})
	.skip(fromStory)
	.take(toStory - fromStory)
	.flatMap(function(res){
		return get(rootUrl + version + '/item/' + res + '.json');
	})
	.map(function(res){
		if (Array.isArray(res))
			return res[1];
		else
			return res;
	})
	.map(function(res){
		return JSON.parse(res);
	})
	.subscribe(
			function(x){
				stories[storyIds.indexOf(x.id)] = x;
			},
			function(err){
				logger.error(err);
			},
			function() {
				res.send(stories.filter(function(arrayValue){
					return arrayValue != null;
				}));
			}
	);
};

module.exports.hnAPIRootURL = rootUrl;
module.exports.hnAPIVersion = version;
module.exports.rxNodeCallback = get;
module.exports.fetchStories = fetchStories;
