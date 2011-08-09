/**
 * XHRReader a class for reading xml or rss from given url to read function
 */
var XHRReader = function(){
    var XHRreader={
        /**
         * original jfeed function that read xml and convert it into json, in case you want to read any other formats or use other lib you may override thid function in options object.
         * @param url: the url reads from.
         * @param handler: the function the will be executed after ajax read complete, pathes the rss to it as an object.
         * @param pathObject: object to be pathed to the handler.
         * @requires jfeed lib http://plugins.jquery.com/project/jFeed , jquery http://jquery.com/.
         */
        reedJFeed:function(url,pathObject,handler){
            jQuery.getFeed({
                url:url,
                success:function(rss){
                    handler(rss,pathObject);
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                }
            });
        },
        /**
         * read json.
         * @param url: the url reads from.
         * @param handler: the function the will be executed after ajax read complete, pathes the rss to it as an object.
         * @param pathObject: object to be pathed to the handler.
         * @requires jquery http://jquery.com/.
         */
        reedJSON:function(url,pathObject,handler){
            $.ajax({
                url:url,
                dataType:'json',
                success:function(rss){
                    handler(rss,pathObject);
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                }
            });
        },
        /**
         * read feed based on type and return json.
         * @param url: the url reads from.
         * @param handler: the function the will be executed after ajax read complete, pathes the rss to it as an object.
         * @param pathObject: object to be pathed to the handler.
         * @param type: string represnts the feed type <b>'json'</b> or <b>'xml'</b>
         */
        read:function(type,url,pathObject,handler){
            switch(type){
                case 'xml':{
                    XHRreader.reedJFeed(url, pathObject, handler);
                    break;
                }
                case 'json':{
                    XHRreader.reedJSON(url, pathObject, handler);
                    break;
                }
                default:{
                    console.log('unknown type '+type+' please use either xml or json.');
                }
            }
        }
    }
    return XHRreader;
}

var XHRreader = XHRReader();

