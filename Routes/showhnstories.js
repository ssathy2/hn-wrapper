var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getShowHNStories(req, res, next){
	logger.info('getShowHNStories: ' + req);
	helpers.fetchStories(helpers.hnURL('showstories.json'), req, res, next, false);
	logger.info('getShowHNStories response: ' + res);	
}

function getShowHNStories_v2(req, res, next){
	logger.info('getShowHNStories_v2: ' + req);
	helpers.fetchStories_v2(helpers.hnURL('showstories.json'), req, res, next, false);
	logger.info('getShowHNStories response: ' + res);	
}

module.exports.getShowHNStories_v2 = getShowHNStories_v2;
module.exports.getShowHNStories = getShowHNStories;