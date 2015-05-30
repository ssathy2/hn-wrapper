var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getNewStories(req, res, next){
	logger.info('getNewStories request: ' + req);
	helpers.fetchStories(helpers.hnURL('newstories.json'), req, res, next, false);
	logger.info('getNewStories response: ' + res);	
}

module.exports.getNewStories = getNewStories;