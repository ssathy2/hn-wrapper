var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getJobHNStories(req, res, next){
	logger.info('getJobHNStories: ' + req);
	helpers.fetchStories(helpers.hnURL('jobstories.json'), req, res, next, false);
	logger.info('getJobHNStories response: ' + res);	
}

module.exports.getJobHNStories = getJobHNStories;