var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getJobHNStories(req, res, next){
	logger.info('getJobHNStories: ' + req);
	helpers.fetchStories(helpers.hnAPIRootURL + helpers.hnAPIVersion + '/jobstories.json', req, res, next, false);
	logger.info('getJobHNStories response: ' + res);	
}

module.exports.getJobHNStories = getJobHNStories;