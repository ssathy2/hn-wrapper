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

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
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
	var story;
	
	get(url)
	.map(function(res){
		return res[1];
	})
	.map(function(res){
		storyIds = JSON.parse(res);
		return storyIds;
	})
	.flatMap(function(res){
		return Rx.Observable.from(res);
	})
	.skip(fromStory)
	.take(toStory - fromStory)
	.flatMap(function(storyID){
		currentStoryId = storyID;
		return rxredis.valueForKey(storyID);
	})
	.flatMap(function(res){
		if (res != undefined)
			return Rx.Observable.return(res);
		else
			return get(rootUrl + version + '/item/' + currentStoryId + '.json'); 
	})
	.map(function(res){
		if (res[1])
			return res[1];
		else
			return res;
	})
	.map(function(rawJSON){
		if (isJson(rawJSON))
			return JSON.parse(rawJSON);
		else
			return rawJSON;
	})
	.subscribe(
		function(x){
			if (useCache)	
				rxredis.setValueForKey(x.id, x, true, 60);					
			stories[storyIds.indexOf(x.id)] = x;
		},
		function(err){
			logger.error(err);			
		},
		function(){
			logger.info('Completed for outer sub');
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
