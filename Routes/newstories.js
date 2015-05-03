var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getNewStories(req, res, next){
	logger.info('getNewStories request: ' + req);
	helpers.fetchStories(helpers.hnAPIRootURL + helpers.hnAPIVersion + '/newstories.json', req, res, next, false);
	logger.info('getNewStories response: ' + res);	
}

module.exports.getNewStories = getNewStories;