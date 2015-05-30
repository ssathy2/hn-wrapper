HN-Wrapper
=========

This is a wrapper around the newly released official Hacker News API. 
It uses RxJS to populate the ids that are returned from the official API with the item details and then returns those created objects.

Top Stories
------
endpoint: `/getTopStories` , `/topstories`

optional params: `fromStory`, `toStory`

This call gets the Hacker News top stories page, optional params take integer values for stories to return

**Example**

`http GET http://localhost:5000/getTopStories?fromStory=0&toStory=2`
`http GET http://localhost:5000/topstories?fromStory=0&toStory=2`

This returns the top 2 stories from the front page.

    [
        {
            "by": "neonkiwi",
            "id": 8439408,
            "kids": [
                8439535,
                8439672,
                8439436,
                8439681,
                8439737,
                8439734,
                8439715,
                8439968,
                8440352,
                8440176,
                8440109,
                8439678,
                8439868,
                8439783,
                8439527,
                8439776,
                8439775,
                8439844,
                8439659,
                8440026,
                8440147
            ],
            "score": 181,
            "text": "",
            "time": 1412966894,
            "title": "What will it take to run a 2-hour marathon?",
            "type": "story",
            "url": "http://rw.runnersworld.com/sub-2/"
        },
        {
            "by": "scobar",
            "id": 8439648,
            "kids": [
                8439915,
                8440598,
                8439883,
                8440308,
                8439903,
                8440117,
                8439946,
                8439899,
                8440059,
                8439852,
                8439894,
                8439920,
                8439887,
                8439842,
                8439951,
                8439939
            ],
            "score": 79,
            "text": "",
            "time": 1412970221,
            "title": "The Toughest Adversity I've Ever Faced",
            "type": "story",
            "url": "http://scottbarbian.com/the-toughest-adversity-ive-ever-faced"
        }
    ]

The `kids` data structure will be populated on the network call for the specific details on that story.
Defaults to pulling down all 100 stories unless query params are included.

Comments
============
endpoint: `/getComments` , `/comments`

required params: `storyID`

This call returns a fully formed comment tree for a given id.

**Example**

`http GET http://localhost:5000/getComments?storyID=9630875`
`http GET http://localhost:5000/comments?storyID=9630875`

This returns the fully formed comment tree for the story with an id of 9630875.

    [
    {
        "by": "aspir",
        "id": 9631373,
        "kids": [
            {
                "by": "jacobolus",
                "id": 9631559,
                "parent": 9631373,
                "text": "There’s been some work along these lines recently:<p><a href=\"http:&#x2F;&#x2F;cartography.oregonstate.edu&#x2F;pdf&#x2F;2012_Jenny_AdaptiveCompositeMapProjections.pdf\" rel=\"nofollow\">http:&#x2F;&#x2F;cartography.oregonstate.edu&#x2F;pdf&#x2F;2012_Jenny_AdaptiveCo...</a><p><a href=\"http:&#x2F;&#x2F;web.stanford.edu&#x2F;~sukolsak&#x2F;projects&#x2F;cs448b_final_paper.pdf\" rel=\"nofollow\">http:&#x2F;&#x2F;web.stanford.edu&#x2F;~sukolsak&#x2F;projects&#x2F;cs448b_final_pape...</a>",
                "time": 1433016045,
                "type": "comment"
            },
            {
                "by": "magicalist",
                "id": 9631451,
                "parent": 9631373,
                "text": "Yes, I&#x27;d love a major mapping service to consider something like <a href=\"http:&#x2F;&#x2F;cartography.oregonstate.edu&#x2F;demos&#x2F;AdaptiveCompositeMapProjections&#x2F;\" rel=\"nofollow\">http:&#x2F;&#x2F;cartography.oregonstate.edu&#x2F;demos&#x2F;AdaptiveCompositeMa...</a><p>We now have maps that resemble nothing like any paper map before. There&#x27;s no reason at all they have to be like zooming closer to the biggest paper map ever made.<p>(Web) Mercator is almost certainly the right choice for the things most people use maps for: local directions, routing etc. Minimal distortion on that scale. If you look at the &quot;Projection Diagram&quot; on that page, Mercator is only used for the highest zoom levels, however. Above that it&#x27;s adaptive based on both zoom and latitude.",
                "time": 1433013950,
                "type": "comment"
            }
        ],
        "parent": 9630875,
        "text": "I&#x27;d love to see a mapping service with dynamic projection functionality based on zoom and window view. The concept of one fixed projection doesn&#x27;t account for the nature of digital mapping today.",
        "time": 1433012753,
        "type": "comment"
    },
    {
        "by": "fennecfoxen",
        "id": 9631260,
        "kids": [
            {
                "by": "saurik",
                "id": 9631467,
                "kids": [
                    {
                        "by": "maxerickson",
                        "id": 9631659,
                        "parent": 9631467,
                        "text": "The simpler calculation was probably chosen because it would be a bad idea to store or analyze data in Web Mercator (so the projection is done each time a tile is rendered).<p>I wouldn&#x27;t be terribly surprised if the person who set it all up chose the &quot;wrong&quot; radius (from your link) in order to make the projection even less useful for analysis.",
                        "time": 1433018171,
                        "type": "comment"
                    },
                    {
                        "by": "jacobolus",
                        "id": 9631547,
                        "parent": 9631467,
                        "text": "It’s kind of stupid to use “Google Mercator” instead of a conformal cylindrical projection of an ellipsoid <a href=\"http:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Mercator_projection#Generalization_to_the_ellipsoid\" rel=\"nofollow\">http:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Mercator_projection#Generalizat...</a><p>However, the difference between that and Google Mercator is in practice pretty slight, since the flattening of the WGS84 ellipsoid is only about 1 part in 300. It’s not really that big a deal for most uses, IMO. Anyone with a use case where it matters can pick a different projection and either source data elsewhere or reproject the data from Google Maps or whatever similar source. If people are using Google Maps (or similar) data in inappropriate contexts, they should stop doing that.<p>The bigger problem is using a Mercator projection at all for small-scale (zoomed out) views of the map in contexts like a convenient online map viewer where less savvy viewers are likely to be mislead by the scale distortion, and get little benefit from having straight rhumb lines.",
                        "time": 1433015690,
                        "type": "comment"
                    }
                ],
                "parent": 9631260,
                "text": "That is the first over-two-thirds of the article, which is an argument for Mercator. Web Mercator is not conformal, which is admitted in the last part of the document. I personally find the final argument for Web Mercator to be a bunch of hand waving that seems to use &quot;complexity&quot; in inconsistent ways, ignoring that having data that is actually accurate and based on a consistent formula is &quot;less complex&quot; even if it requires a small amount of extra trigonometry (and I&#x27;m not even certain that that is really true, though I have not had a chance to finish all of the reading I have on my todo list for map projections, Web Mercator in particular; see URL).<p><a href=\"http:&#x2F;&#x2F;cegis.usgs.gov&#x2F;projection&#x2F;pdf&#x2F;Battersby_Implications%20of%20Web%20Mecator%20and%20Its%20Use%20in%20Online%20Mapping.pdf\" rel=\"nofollow\">http:&#x2F;&#x2F;cegis.usgs.gov&#x2F;projection&#x2F;pdf&#x2F;Battersby_Implications%...</a>",
                "time": 1433014221,
                "type": "comment"
            }
        ],
        "parent": 9630875,
        "text": "Summary: It&#x27;s about the only conformal map out there where &quot;north&quot; is always up. (Conformal: when you zoom in on it, the map that you see has the right shapes and so makes sense locally, and is not terribly distorted.) So you can pan and zoom to your heart&#x27;s content.",
        "time": 1433011477,
        "type": "comment"
    },
    {
        "by": "robotcookies",
        "id": 9631588,
        "kids": [
            {
                "by": "jacobolus",
                "id": 9631616,
                "parent": 9631588,
                "text": "The problem is that Google Maps has become a very convenient always available source for maps, and the brand is highly trusted. Moreover, many other online mapping services have adopted the same projection.<p>Students (or whoever else) who might have previously gone to look up a region of the world on a globe, large paper map, or atlas are now turning to sites like Google Maps instead. The market for high quality paper maps has fallen quite a bit as more convenient online maps become the go-to source for answering all sorts of geographic questions.<p>Moreover, Mercator maps are turning up as the basis for many other tools. For instance, several online map collections have started georeferencing and reprojecting historical maps onto a Mercator projection, saving them as raster tiles, and allowing visitors to pan and zoom around on those reprojected maps, Google-Maps style. Instead of looking at various original maps with region-specific projections, now the viewer is getting more and more exposure to just Mercator maps.<p>If you look around the web, there are many examples of good maps with reasonable projections, but there are also many many examples of people using the Mercator projection in wholly inappropriate contexts. For example, I see Mercator choropleths of US statistical data quite frequently, which should be using something like an Albers equal-area conic projection instead. (<a href=\"http:&#x2F;&#x2F;bl.ocks.org&#x2F;mbostock&#x2F;3734308\" rel=\"nofollow\">http:&#x2F;&#x2F;bl.ocks.org&#x2F;mbostock&#x2F;3734308</a>)<p>On the bright side, work like the D3 guys (Mike Bostock &amp; Jason Davies) and others have been doing has made it easier than ever to construct nice web maps in all sorts of projections, without shelling out big bucks for fancy GIS software.<p><a href=\"http:&#x2F;&#x2F;www.jasondavies.com&#x2F;maps&#x2F;\" rel=\"nofollow\">http:&#x2F;&#x2F;www.jasondavies.com&#x2F;maps&#x2F;</a><p><a href=\"https:&#x2F;&#x2F;github.com&#x2F;d3&#x2F;d3-geo-projection&#x2F;\" rel=\"nofollow\">https:&#x2F;&#x2F;github.com&#x2F;d3&#x2F;d3-geo-projection&#x2F;</a>",
                "time": 1433017368,
                "type": "comment"
            }
        ],
        "parent": 9630875,
        "text": "Do people really complain because google maps uses Mercator (or a similar) projection? My understanding was that the complaint was when Mercator is used for wall maps like in the classroom. When you show the whole world using it, the sizes of the continents are way off proportion.<p>On a zoomed in scale like when showing streets or smaller areas, it doesn&#x27;t matter.",
        "time": 1433016837,
        "type": "comment"
    }
    ]