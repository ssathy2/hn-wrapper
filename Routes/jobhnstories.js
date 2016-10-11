var helpers = require('../Utilities/helpers')
var logger = require('../Utilities/logger')

function getJobHNStories(req, res, next){
	logger.info('getJobHNStories: ' + req);
	helpers.fetchStories(helpers.hnURL('jobstories.json'), req, res, next, false);
	logger.info('getJobHNStories response: ' + res);	
}

function getJobHNStories_v2(req, res, next){
	logger.info('getJobHNStories_v2: ' + req);
	helpers.fetchStories_v2(helpers.hnURL('jobstories.json'), req, res, next, false);
	logger.info('getJobHNStories_v2 response: ' + res);	
}

module.exports.getJobHNStories_v2 = getJobHNStories_v2;
module.exports.getJobHNStories = getJobHNStories;