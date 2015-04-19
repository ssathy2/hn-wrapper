var Rx = require('rx');
var request = require('request');

var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var get = Rx.Observable.fromNodeCallback(request);

var rxredis = require('../Utilities/rxredis');

/**
    The data structure we're storing into redis looks like:
    id : {
        commentTree       : <comment tree array>
    }
    
    We set the expire time of the key to be 60 seconds or 6000 msecs
*/

var COMMENTTREEKEY       = 'COMMENTTREEKEY';

// Have a full comment/story object here...
// properly process the kids array of the comment/story object
function getComments_recursive(commentObject){
    if (!commentObject || !commentObject.kids) 
        return Rx.Observable.empty();

    var idx = 0;
    return Rx.Observable.fromArray(commentObject.kids)
        .filter(function(kidID){
            return kidID != null;
        })
        .flatMap(function(kidID){
            return getItem(kidID)
            .flatMap(function(kidJSON){
                commentObject.kids[idx] = kidJSON;
                idx++;                 
                return getComments_recursive(kidJSON);
            })
        }) 
}

function getItem(itemID){
	return get(rootUrl+version+'/item/'+itemID+'.json')
		.map(function(res){
			return res[1];
		})
        .filter(function(element){
            return element != null;
        })
		.map(function(rawJSON){
			return JSON.parse(rawJSON);
		})
}

function full_getComments(storyID){
    // get the root parentStory
    var item;
    return Rx.Observable.create(function(observer){
        getItem(storyID)
        .flatMap(function(parsedItem){
            item = parsedItem;
            return getComments_recursive(parsedItem)
        })
        .subscribe(
            function(onNextValue){

            },
            function(error){
                observer.onError(error);
            },
            function(){
                observer.onNext(item);
                observer.onCompleted();
            }
        );
    });
}

function getComments(req, res, next){
    var comments;
    var storyID = req.query.storyID;
    if (!storyID)
    {
        res.send('400', 'Invalid request (No storyID provided)');
        next();
        return;
    }

    var entry;
    getEntryForParentID(storyID)
    .subscribe(
        function(onNext){
            entry = onNext;
        },
        function(error){

        },
        function(){
            if (!entry){
                var startDate = new Date();
                console.log('Refreshing cache...');
                //fetch comments
               full_getComments(storyID)
                .subscribe(
                    function(onNextValue){
                        comments = onNextValue;
                    },
                    function(error){
                        console.log(error)
                    },
                    function(){
                        storeKidsForParentID(comments.id, comments.kids)
                        .subscribe(
                            function(onNext){
                                res.json(onNext[COMMENTTREEKEY]);
                            },
                            function(error){

                            },
                            function(){
                                var endDate = new Date();
                                var difference = (endDate - startDate);
                                console.log('Complete');
                                console.log('Fetch time: ' + difference + ' msecs');
                                next();
                            }
                        )
                    }
                ); 
            }
            else {
                console.log('Using cache...');
                res.json(entry[COMMENTTREEKEY])
                next();
            }
        }
    )
}

var SECONDSINONEMINUTE = 60;

function storeKidsForParentID(parentID, kids){
    var obj = {
        COMMENTTREEKEY       : kids
    }
    return rxredis.setValueForKey(parentID, obj, true, SECONDSINONEMINUTE);
}

function getEntryForParentID(parentID){
    return rxredis.valueForKey(parentID);
}

module.exports.getComments = getComments;