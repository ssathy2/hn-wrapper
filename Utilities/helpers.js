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
	var story;
	var isStoryFetchingCompleted = false;
	
	var source = 
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
						return get(rootUrl + version + '/item/' + storyID + '.json');
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
				get(rootUrl + version + '/item/' + storyID + '.json')
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
			logger.info('Completed for outer sub');
			
			res.send(stories.filter(function(arrayValue){
				return arrayValue != null;
			}));
		}
	);	
//	.concatMap(function (x, i) {
//		currentStoryId = x;
//    	return rxredis.valueForKey(x); 
//    })
//	.map(function(value){
//		if (value && useCache)
//			return value;
//		else
//			return get(rootUrl + version + '/item/' + currentStoryId + '.json')
//	})
//	.map(function(res){
//		return res;
//	})
	
//	.subscribe(
//		function(storyID){
//			rxredis.valueForKey(storyID)
//			.flatMap(function(res){
//				if (res != undefined)
//					return Rx.Observable.return(res);
//				else
//					return get(rootUrl + version + '/item/' + storyID + '.json'); 
//			})
//			.map(function(res){
//				if (res[1])
//					return res[1];
//				else
//					return res;
//			})
//			.map(function(rawJSON){
//				return JSON.parse(rawJSON);
//			})
//			.subscribe(
//				function(x){
//					if (useCache)	
//						rxredis.setValueForKey(x.id, x, true, 60);					
//					stories[storyIds.indexOf(x.id)] = x;
//				},
//				function(err){
//					
//				},
//				function(){
//					
//				}
//			);
//		},
//		function(err){
//			logger.error(err);
//		},
//		function(){
//			logger.info('Completed for outer sub');
//			
//			res.send(stories.filter(function(arrayValue){
//				return arrayValue != null;
//			}));
//		}
//	);
};

module.exports.hnAPIRootURL = rootUrl;
module.exports.hnAPIVersion = version;
module.exports.rxNodeCallback = get;
module.exports.fetchStories = fetchStories;
