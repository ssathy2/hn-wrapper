var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getAskHNStories(req, res, next){
	logger.info('getAskHNStories: ' + req);
	helpers.fetchStories(helpers.hnURL('askstories.json'), req, res, next, false);
	logger.info('getAskHNStories response: ' + res);	
}

module.exports.getAskHNStories = getAskHNStories;