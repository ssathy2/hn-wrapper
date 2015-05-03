var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getTopStories(req, res, next){
	logger.info('getTopStories: ' + req);
	helpers.fetchStories(helpers.hnAPIRootURL + helpers.hnAPIVersion + '/topstories.json', req, res, next, false);
	logger.info('getTopStories response: ' + res);	
}

module.exports.getTopStories = getTopStories;