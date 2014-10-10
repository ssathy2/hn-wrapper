var restify = require('restify');
var request = require('request');
var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var get = Rx.Observable.fromNodeCallback(request);

function getTopStories(req, res, next){
    var topStories = [];
    var fromStory = req.query.fromStory;
    var toStory = req.query.toStory;
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
        return JSON.parse(res);     //turn it into a object
    })
    .flatMap(function(res) {
        return Rx.Observable.fromArray(res);    //map each of the story item ids into an observable
    })
    .skip(fromStory)
    .take(toStory)       //take the max
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
                topStories[topStories.length] = x;
            },
            function (err) {
                console.log('Error:  ' + err);
            },
            function () {
                res.send(topStories);
            }
    );
}

var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
function getComments(parentStoryID, startDepth, endDepth)
{
	// request parent story
	// grab 'kids' field from parent story response
	// the field from part 2 contains depth 0 comments
	// for each kid, request the item and recurse as far as endDepth param specifies
	var arr = []
	getItem(parentStoryID)
		.map(function(parsedJSON){
			// have a parent comment here
			return parsedJSON['kids']
		})
		.flatMap(function(kids){
			// returning an observable for each 'kid' in the kids array
			return Rx.Observable.fromArray(kids)
		})
		.flatMap(function(kid){
			// kid is an id so get item on it
			return getItem(kid)
		})
		// have an observable from getItem(...) here
		.subscribe(
				function(parsedJSONKid){
					arr[arr.length] = parsedJSONKid
				},
				function(error){
					console.log(error)
				},
				function(){
					console.log("Complete")
					console.dir("arr: " + arr)
				}
		);
}

function getItem(itemID)
{
	return get(rootUrl+version+'/item/'+itemID+'.json')
	.map(function(res){
		return res[1]
	})
	.map(function(rawJSON){
		return JSON.parse(rawJSON)
	});
}

//getTopStories(10);
getComments('8863', 0, 0)

server.get('/getTopStories', getTopStories); 
var port = process.env.PORT || 5000;
server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});
