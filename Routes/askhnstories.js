var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getAskHNStories(req, res, next){
	logger.info('getAskHNStories: ' + req);
	helpers.fetchStories(helpers.hnURL('askstories.json'), req, res, next, false);
	logger.info('getAskHNStories response: ' + res);	
}

function getAskHNStories_v2(req, res, next){
	logger.info('getAskHNStories_v2: ' + req);
	helpers.fetchStories_v2(helpers.hnURL('askstories.json'), req, res, next, false);
	logger.info('getAskHNStories_v2 response: ' + res);	
}

module.exports.getAskHNStories_v2 = getAskHNStories_v2;
module.exports.getAskHNStories = getAskHNStories;