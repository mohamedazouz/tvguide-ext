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
                "opimg string,active boolean);",
                [],
                function() {
                    console.log("channels on");
                },
                TVGdb.onError);
            tx.executeSql("create table if not exists " +
                "programs (id integer primary key asc, channelId integer, title string, link string, stars string, img string, "+
                "sttime string, endtime string, category string, follow boolean);",
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
    Channels:null,
    Programs:null
}
/**
 * channels table object.
 */
TVGdb.Channels={
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
     * populate the channel list into the channels table from array of channel opject {name,url}
     */
    populateChannels:function(channels){
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM channels ;",
                [],
                function(tx,results) {
                    if(parseInt(results.rows.length) == 0){
                        for(var i=0; i < channels.length ;i++){
                            tx.executeSql("INSERT into channels (name,url,img,opimg,active) VALUES (?,?,?,?,?);",
                                [channels[i].name,channels[i].url,channels[i].img,channels[i].opimg,false],
                                function(){
                                    console.log("channels added.")
                                },
                                TVGdb.onError);
                        }
                    }
                });
        },
        TVGdb.onError);
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
}
/**
 * programs table object.
 */
TVGdb.Programs={
    /**
     * get a list of programs for a channels.
     * @param channelId the channel id.
     * @param handler method to catch the list of programs.
     */
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
    /**
     * get a list of todays programs for a channel.
     * @param channelId the channel id.
     * @param handler method to catch the list of programs.
     */
    getTodayChannelPrograms:function(channelId,handler){
        var programs=[];
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM programs WHERE channelId = ? AND sttime LIKE(?);",
                [channelId,date_util.today("-")+'%'],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        programs.push(util.clone(results.rows.item(i)));
                    }
                    handler(programs);
                },
                TVGdb.onError);
        });
    },
    /**
     * get a list of tomorrows programs for a channel.
     * @param channelId the channel id.
     * @param handler method to catch the list of programs.
     */
    getTomorrowChannelPrograms:function(channelId,handler){
        var programs=[];
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM programs WHERE channelId = ? AND sttime LIKE(?);",
                [channelId,date_util.tomorrow('-')+'%'],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        programs.push(util.clone(results.rows.item(i)));
                    }
                    handler(programs);
                },
                TVGdb.onError);
        });
    },
    /**
     * set the list of programs for a channel.
     * @param channelId the channel id.
     * @param programs a list of programs to be populated.
     * @param handler method to run after population success.
     */
    setChannelPrograms:function(channelId,programs,handler){
        TVGdb.db.transaction(function(tx) {
            for(i=0; i< programs.length; i++){
                tx.executeSql("INSERT into programs (channelId,title,link,stars,img,sttime,endtime,category,follow) VALUES (?,?,?,?,?,?,?,?,?);",
                    [channelId,programs[i].title,programs[i].link,programs[i].stars,programs[i].img,
                    programs[i].sttime,programs[i].endtime,programs[i].category,false],
                    handler,
                    TVGdb.onError);
            }
        });
    },
    /**
     * get program details object with it's id.
     * @param programId the program id.
     * @param handler a method to catch the program object.
     */
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
    },
    /**
     * delete programs for a channel.
     * @param channelId the channel id.
     * @param handler a mehtod to run after success.
     */
    deleteChannelPrograms:function(channelId,handler){
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM programs WHERE channelId=?;",
                [channelId],
                handler,
                TVGdb.onError);
        });
    },
    /**
     * updates the programs list for a channel, this fuction should merge the old list with the new list.
     * @param channelId the channel id.
     * @param program the program object.
     * @param handler the method object.
     */
    updateChannelProgram:function(channelId,program,handler){
        TVGdb.db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM programs WHERE sttime=? AND endtime=? AND channelId=?',
                [program.sttime,program.endtime,channelId],
                function(tx,results){
                    if(results.rows.length == 0){
                        TVGdb.Programs.setChannelPrograms(channelId, [program], handler);
                    }
                },
                TVGdb.onError)
        });
    },
    /**
     * updates the programs list for a channel, this fuction should merge the old list with the new list.
     * @param channelId the channel id.
     * @param programs the programs list.
     * @param handler the method object.
     */
    updateChannelPrograms:function(channelId,programs,handler){
        for(j in programs){
            TVGdb.Programs.updateChannelProgram(channelId, programs[j], handler);
        }
    },
    /**
     * mark a program as followed to allow user to see notifications for this program.
     * @param programId
     * @param handler
     */
    followProgram:function(programId,handler){
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("UPDATE programs SET follow = ? WHERE id =?;",
                [true,programId],
                handler,
                TVGdb.onError);
        });
    },
    /**
     * mark a program as unfollowed to remove notification for this program.
     * @param programId
     * @param handler
     */
    unfollowProgram:function(programId,handler){
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("UPDATE programs SET follow = ? WHERE id =?;",
                [false,programId],
                handler,
                TVGdb.onError);
        });
    },
    getTodaysFollowedPrograms:function(handler){
        var programs=[];
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM programs WHERE follow = ? AND sttime LIKE(?);",
                [true,date_util.today("-")+'%'],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        programs.push(util.clone(results.rows.item(i)));
                    }
                    handler(programs);
                },
                TVGdb.onError);
        });
    },
    getFollowedPrograms:function(handler){
        var programs=[];
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM programs WHERE follow = ? ;",
                [true],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        programs.push(util.clone(results.rows.item(i)));
                    }
                    handler(programs);
                },
                TVGdb.onError);
        });
    },
    getFollowedProgramsOrderd:function(handler){
        var programs=[];
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM programs WHERE follow = ? ORDER BY sttime ;",
                [true],
                function(tx, results) {
                    for (i = 0; i < results.rows.length; i++) {
                        programs.push(util.clone(results.rows.item(i)));
                    }
                    handler(programs);
                },
                TVGdb.onError);
        });
    },
    deleteProgramsForDate:function(date,handler){
        TVGdb.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM programs WHERE sttime like(?);",
                [date+"%"],
                handler,
                TVGdb.onError);
        });
    }
}

TVGdb.setupDB();
TVGdb.Channels.populateChannels(staticURL.channels);
