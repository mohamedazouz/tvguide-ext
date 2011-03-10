/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
TVGBG=function(){
    var background={
        doInBackGround:function(){
            window.setInterval("background.updatePrograms()",1000 * 60 * 60 * 2);
        },
        updatePrograms:function(){
            console.log('updating the programs at:'+new Date().getHours()+":"+new Date().getMinutes());
            TVGdb.Channels.getActiveChannels(function(activechannels){
                for(i = 0 ; i < activechannels.length; i++){
                    XHRreader.read('xml', activechannels[i].url, {
                        channelId:activechannels[i].id
                    }, function(feed,ob){
                        //channelId,title,link,stars,img,sttime,endtime,category
                        var programs=[];
                        for(j=0;  j <feed.items.length ; j++){
                            var concatstars=function(stars){
                                var sts=''
                                for(s=0; s<stars.length;s++){
                                    sts+=stars[s].name+(s==stars.length-1?'':',')
                                }
                                return sts;
                            }
                            programs.push({
                                channelId:ob.channelId,
                                title:feed.items[j].title,
                                link:feed.items[j].link,
                                img:feed.items[j].image,
                                category:feed.items[j].category,
                                sttime:feed.items[j].BroadCastStartTime,
                                endtime:feed.items[j].BroadCastEndTime,
                                stars:concatstars(feed.items[j].stars)
                            });
                        }
                        TVGdb.Programs.updateChannelPrograms(ob.channelId, programs, function(){});
                    });
                }
            })
        }
    }
    background.doInBackGround();
    background.updatePrograms();
    return background;
}

var background = TVGBG();
