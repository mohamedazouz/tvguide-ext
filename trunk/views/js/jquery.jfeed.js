/* jFeed : jQuery feed parser plugin
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */

jQuery.getFeed = function(options) {

    options = jQuery.extend({

        url: null,
        data: null,
        success: null,
        error:null

    }, options);

    if(options.url) {

        $.ajax({
            type: 'GET',
            url: options.url,
            cache:false,
            data: options.data,
            dataType: 'xml',
            success: function(xml) {
                var feed = new JFeed(xml);
                if(jQuery.isFunction(options.success)) options.success(feed);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                options.error(XMLHttpRequest, textStatus, errorThrown);
            }
        });
    }
};

function JFeed(xml) {
    if(xml) this.parse(xml);
};

JFeed.prototype = {

    type: '',
    version: '',
    title: '',
    link: '',
    description: '',
    parse: function(xml) {

        if(jQuery('channel', xml).length == 1) {

            this.type = 'rss';
            var feedClass = new JRss(xml);

        } else if(jQuery('feed', xml).length == 1) {

            this.type = 'atom';
            var feedClass = new JAtom(xml);
        }

        if(feedClass) jQuery.extend(this, feedClass);
    }
};

function JFeedItem() {};

JFeedItem.prototype = {

    title: '',
    link: '',
    description: '',
    updated: '',
    id: ''
};

function JAtom(xml) {
    this._parse(xml);
};

JAtom.prototype = {

    _parse: function(xml) {

        var channel = jQuery('feed', xml).eq(0);

        this.version = '1.0';
        this.title = jQuery(channel).find('title:first').text();
        this.link = jQuery(channel).find('link:first').attr('href');
        this.description = jQuery(channel).find('subtitle:first').text();
        this.language = jQuery(channel).attr('xml:lang');
        this.updated = jQuery(channel).find('updated:first').text();

        this.items = new Array();

        var feed = this;

        jQuery('entry', xml).each( function() {

            var item = new JFeedItem();

            item.title = jQuery(this).find('title').eq(0).text();
            item.link = jQuery(this).find('link').eq(0).attr('href');
            item.description = jQuery(this).find('content').eq(0).text();
            item.updated = jQuery(this).find('updated').eq(0).text();
            item.id = jQuery(this).find('id').eq(0).text();
            item.image = jQuery(this).find('image').eq(0).text();
            item.BroadCastStartTime = jQuery(this).find('BroadCastStartTime').eq(0).text();
            item.BroadCastEndTime = jQuery(this).find('BroadCastEndTime').eq(0).text();
            //            item.BroadCastEndTime = jQuery(this).find('BroadCastEndTime').eq(0).text();

            feed.items.push(item);
        });
    }
};

function JRss(xml) {
    this._parse(xml);
};

JRss.prototype  = {

    _parse: function(xml) {

        if(jQuery('rss', xml).length == 0) this.version = '1.0';
        else this.version = jQuery('rss', xml).eq(0).attr('version');

        var channel = jQuery('channel', xml).eq(0);

        this.name=jQuery(channel).find('name:first').text();
        this.date = jQuery(channel).find('pubDate:first').text();
        this.language = jQuery(channel).find('language:first').text();


        this.items = new Array();

        var feed = this;

        jQuery('item', xml).each( function() {

            var item = new JFeedItem();

            item.title = jQuery(this).find('title').eq(0).text();
            item.link = jQuery(this).find('link').eq(0).text();
            stars = new Array();

            starsfeed=jQuery(this).find('star');

            for(i=0;i<starsfeed.length;i++){
                var itemstar = new JFeedItem();
                itemstar.name=starsfeed.eq(i).text();
                stars.push(itemstar);
            }
            item.stars=stars;
            item.startdate=jQuery(this).find('BroadCastStartTime').eq(0).text();
            item.enddate=jQuery(this).find('BroadCastEndTime').eq(0).text();
            item.category=jQuery(this).find('category').eq(0).text();
            item.image = jQuery(this).find('image').eq(0).text();
            item.BroadCastStartTime = jQuery(this).find('BroadCastStartTime').eq(0).text();
            item.BroadCastEndTime = jQuery(this).find('BroadCastEndTime').eq(0).text();
            feed.items.push(item);
        });
    }
};
