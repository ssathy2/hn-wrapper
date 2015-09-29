var Rx = require('rx');
var request = require('request');
var helpers = require('../Utilities/helpers');
var logger  = require('../Utilities/logger')
var get     = Rx.Observable.fromNodeCallback(request);
var rxredis = require('../Utilities/rxredis');

// Have a full comment/story object here...
// properly process the kids array of the comment/story object
function getComments_recursive(commentObject){
    if (!commentObject)
        return Rx.Observable.empty();

    if (!commentObject.kids)
    return Rx.Observable.just([]);

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
	return get(helpers.hnURL('item/'+itemID+'.json'))
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
            return getComments_recursive(parsedItem);
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
    
    var startDate = new Date();
    var entry;
    getEntryForParentID(storyID)
    .subscribe(
        function(onNext){
            entry = onNext;
        },
        function(error){

        },
        function(){
            logger.info("Took " + (new Date() - startDate) + " seconds for redis get"); 
            if (!entry){
                
                logger.info('Refreshing cache...');
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
                                logger.info(onNext)
                                res.json(comments.kids);
                            },
                            function(error){

                            },
                            function(){
                                var endDate = new Date();
                                var difference = (endDate - startDate);
                                logger.info('Complete');
                                logger.info('Fetch time: ' + difference + ' msecs');
                                next();
                            }
                        )
                    }
                ); 
            }
            else {
                logger.info('Using cache...');
                res.json(JSON.parse(entry));
                next();
            }
        }
    )
}

var SECONDSINONEMINUTE = 60;

function storeKidsForParentID(parentID, kids){
    return rxredis.setValueForKey(parentID, kids, true, SECONDSINONEMINUTE);
}

function getEntryForParentID(parentID){
    return rxredis.valueForKey(parentID);
}

module.exports.getComments = getComments;