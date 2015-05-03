var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getShowHNStories(req, res, next){
	logger.info('getShowHNStories: ' + req);
	helpers.fetchStories(helpers.hnAPIRootURL + helpers.hnAPIVersion + '/showstories.json', req, res, next, false);
	logger.info('getShowHNStories response: ' + res);	
}

module.exports.getShowHNStories = getShowHNStories;