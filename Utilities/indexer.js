var helpers = require('./helpers');
var Rx 		= require('rx');
var logger	= require('./logger');

function start(){
	fetchLatestItems();
	  
}

function fetchLatestItems(){
	var lastIndexedVal = 10;
	// get the max item id
	helpers.rxNodeCallback(helpers.hnURL('maxitem.json'))
	.map(function(res){
		return res[1];
	})
	.flatMap(function(res){
		return helpers.rxNodeCallback(helpers.hnURL('/item/' + res + '.json'));	
	})
	.map(function(res){
		return res[1];
	})
	.subscribe(
		function(next){
			logger.info(next);	
		},
		function(error){
			logger.error(error);
		},
		function(){
			logger.info('Complete');
		}
	);
}



module.exports.start = start;