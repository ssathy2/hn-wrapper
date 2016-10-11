var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getNewStories(req, res, next){
	logger.info('getNewStories request: ' + req);
	helpers.fetchStories(helpers.hnURL('newstories.json'), req, res, next, false);
	logger.info('getNewStories response: ' + res);	
}

function getNewStories_v2(req, res, next){
	logger.info('getNewStories_v2 request: ' + req);
	helpers.fetchStories_v2(helpers.hnURL('newstories.json'), req, res, next, false);
	logger.info('getNewStories_v2 response: ' + res);	
}

module.exports.getNewStories_v2 = getNewStories_v2;
module.exports.getNewStories = getNewStories;