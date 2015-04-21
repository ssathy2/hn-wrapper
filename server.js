require('newrelic');
var restify = require('restify');
var request = require('request');

var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var get = Rx.Observable.fromNodeCallback(request);

var comments = require('./Routes/comments');

function validateRequest(req, res, next)
{
    var fromStory = req.query.fromStory;
    var toStory   = req.query.toStory;

    if (toStory < fromStory){
        res.send(400, {'error' :'fromStory cannot be greater than toStory'});
        return
    }   
    else
        return true;
}

function getTopStories(req, res, next){
    var topStoriesIds = [];
    var topStories = [];
    var fromStory = req.query.fromStory;
    var toStory = req.query.toStory;

    // validateRequest verifies the request, and returns true if this is a valid request
    // otherwise, validateRequest will send the appropriate error message
    if(!validateRequest(req, res, next))
        return;

    if(!fromStory){
        fromStory = 0;
    }

    if(!toStory){
        toStory = 100;
    }

    get(rootUrl + version + '/topstories.json')
    .map(function(res){
        return res[1];  // get the body
     })
    .map(function(res){
        topStoriesIds = JSON.parse(res);     //turn it into a object
        return topStoriesIds;
    })
    .flatMap(function(res) {
        return Rx.Observable.fromArray(res);    //map each of the story item ids into an observable
    })
    .skip(fromStory)
    .take(toStory - fromStory)                  
    .flatMap(function(res){
        return get(rootUrl + version + '/item/' + res + '.json');   // make the details call on each response
    })
    .map(function(res){
        return res[1];  // get the body     
     })
    .map(function(res){
        return JSON.parse(res);     //turn it into a object
    })
    .subscribe(
            function (x) {
                topStories[topStoriesIds.indexOf(x.id)] = x;
            },
            function (err) {
                console.log('Error:  ' + err);
            },
            function () {
                res.send(topStories.filter(function(arrayValue){
                    return arrayValue != null;
                }));
            }
    );
}

var server = restify.createServer({
  name: 'hn-wrapper',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/getComments', comments.getComments);
server.get('/getTopStories', getTopStories); 
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

var port = process.env.PORT || 5000;
console.log('Port:', port);
console.log('Env variables: ' + process.env['REDIS_URL']);
server.listen(port, function () {
 console.log('%s listening at %s', server.name, server.url);
});
