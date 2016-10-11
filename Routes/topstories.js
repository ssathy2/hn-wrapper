var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getTopStories(req, res, next){
	logger.info('getTopStories: ' + req);
	helpers.fetchStories(helpers.hnURL('topstories.json'), req, res, next, true);
	logger.info('getTopStories response: ' + res);	
}

function getTopStories_v2(req, res, next){
	logger.info('getTopStories_v2: ' + req);
	helpers.fetchStories_v2(helpers.hnURL('topstories.json'), req, res, next, true);
	logger.info('getTopStories_v2 response: ' + res);	
}

module.exports.getTopStories_v2 = getTopStories_v2;
module.exports.getTopStories = getTopStories;