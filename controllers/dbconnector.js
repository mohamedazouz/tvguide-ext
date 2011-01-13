/* 
 * To change TVGdb.db template, choose Tools | Templates
 * and open the template in the editor.
 */
var TVGdb={
    /**
     * not neccessary but to understand that db is an object of TVGdb object.
     */
    db:this.db,
    /**
     * set up the database if it's not up and create the channels table.
     */
    setupDB:function(){
        TVGdb.db = openDatabase('tv guide', '1.0', 'tv guide extension database',  5*1024*1024);
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("create table if not exists " +
                "channels(id integer primary key asc, name string, url string, img string,"+
                "active boolean);",
                [],
                function() {
                    console.log("channels on");
                },
                TVGdb.onError);
            tx.executeSql("create table if not exists " +
                "programs (id integer primary key asc, channelId integer, title string, link string, stars string, img string, "+
                "sttime string, endtime string, category string);",
                [],
                function() {
                    console.log("programs on");
                },
                TVGdb.onError);
        });
    },
    /**
     * error function.
     */
    onError: function(tx,error) {
        console.log("Error occurred: ", error.message);
    },
    /**
     * channels table object.
     */
    Channels:{
        /**
         * populate the channel list into the channels table from array of channel opject {name,url}
         */
        populateChannels:function(channels){
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM channels ;",
                    [],
                    function(tx,results) {
                        if(parseInt(results.rows.length) == 0){
                            for(var i=0; i < channels.length ;i++){
                                tx.executeSql("INSERT into channels (name,url,img,active) VALUES (?,?,?,?);",
                                    [channels[i].name,channels[i].url,channels[i].img,false],
                                    function(){
                                        console.log(channels[i-1].name+" added.")
                                    },
                                    TVGdb.onError);
                            }
                        }
                    });
            },
            TVGdb.onError);
        },
        /**
         * get active channels list
         */
        getActiveChannels:function(handler){
            var activechannels=[];
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM channels WHERE active = ? ;",
                    [true],
                    function(tx, results) {
                        for (i = 0; i < results.rows.length; i++) {
                            activechannels.push(util.clone(results.rows.item(i)));
                        }
                        handler(activechannels);
                    },
                    TVGdb.onError);
            });
        },
        /**
         * get a list on inactive channels.
         */
        getInactiveChannels:function(handler){
            var inactivechannels=[];
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM channels WHERE active = ? ;",
                    [false],
                    function(tx, results) {
                        for (i = 0; i < results.rows.length; i++) {
                            inactivechannels.push(util.clone(results.rows.item(i)));
                        }
                        handler(inactivechannels);
                    },
                    TVGdb.onError);
            });
        },
        /**
         * get a list of all channels
         */
        getChannels:function(handler){
            var channels=[];
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM channels;",
                    [],
                    function(tx, results) {
                        for (i = 0; i < results.rows.length; i++) {
                            channels.push(util.clone(results.rows.item(i)));
                        }
                        handler(channels);
                    },
                    TVGdb.onError);
            });
        },
        /**
         * activate channel.
         */
        activateChannel:function(channelId,handler){
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("UPDATE channels set active=? WHERE id= ?;",
                    [true,channelId],
                    handler,
                    TVGdb.onError);
            });
        },
        /**
         * deactivate channel.
         */
        deactivateChannel:function(channelId,handler){
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("UPDATE channels set active=? WHERE id= ?;",
                    [false,channelId],
                    handler,
                    TVGdb.onError);
            });
        },
        /**
         * get a channel object by it's id, sends the channel object to the handler, null sends where no element with this id.
         */
        getChannel:function(channelId,handler){
            var channel=null;
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM channels WHERE id=?;",
                    [channelId],
                    function(tx, results) {
                        for (i = 0; i < results.rows.length; i++) {
                            channel=(util.clone(results.rows.item(i)));
                        }
                        handler(channel);
                    },
                    TVGdb.onError);
            });
        }
    },
    /**
     * programs table object.
     */
    Programs:{
        getChannelPrograms:function(channelId,handler){
            var programs=[];
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM programs WHERE channelId = ?;",
                    [channelId],
                    function(tx, results) {
                        for (i = 0; i < results.rows.length; i++) {
                            programs.push(util.clone(results.rows.item(i)));
                        }
                        handler(programs);
                    },
                    TVGdb.onError);
            });
        },
        setChannelPrograms:function(channelId,programs,handler){
            TVGdb.db.transaction(function(tx) {
                for(i=0; i< programs.length; i++){
                    tx.executeSql("INSERT into programs (channelId,title,link,stars,img,sttime,endtime,category) VALUES (?,?,?,?,?,?,?,?);",
                        [channelId,programs[i].title,programs[i].link,programs[i].stars,programs[i].img,
                        programs[i].sttime,programs[i].endtime,programs[i].category],
                        handler,
                        TVGdb.onError);
                }
            });
        },
        getProgram:function(programId,handler){
            var program=null;
            TVGdb.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM programs WHERE id=?;",
                    [programId],
                    function(tx, results) {
                        for (i = 0; i < results.rows.length; i++) {
                            program=(util.clone(results.rows.item(i)));
                        }
                        handler(program);
                    },
                    TVGdb.onError);
            });
        }

    }
}
TVGdb.setupDB();
TVGdb.Channels.populateChannels(staticURL.channels);