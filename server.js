require('newrelic');
var restify = require('restify');
var logger  = require('./Utilities/logger');
var indexer  = require('./Utilities/indexer');

var comments = require('./Routes/comments');
var topStories = require('./Routes/topstories');
var newStories = require('./Routes/newstories');
var showhnStories = require('./Routes/showhnstories');
var jobhnStories = require('./Routes/jobhnstories');
var askhnStories = require('./Routes/askhnstories');

var server = restify.createServer({
  name: 'hn-wrapper',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Old endpoints
server.get('/getComments', comments.getComments);
server.get('/getTopStories', topStories.getTopStories);

// New endpoints
server.get('/comments', comments.getComments);
server.get('/topstories', topStories.getTopStories); 
server.get('/newstories', newStories.getNewStories);
server.get('/askhnstories', askhnStories.getAskHNStories);
server.get('/showhnstories', showhnStories.getShowHNStories);
server.get('/jobhnstories', jobhnStories.getJobHNStories);

//indexer.start();

server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

var port = process.env.PORT || 5000;

logger.info('Port:', port);
logger.info('Env variables: ' + process.env['REDIS_URL']);
server.listen(port, function () {
    logger.info('%s listening at %s', server.name, server.url);
});
