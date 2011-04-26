/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
TVGBG=function(){
    var TVbackground={
        doInBackGround:function(){
            window.setInterval(function(){
                TVbackground.updatePrograms()
            },1000 * 60 * 60 * 2);
            window.setInterval(function(){
                TVbackground.checkForNotification();
            },1000 * 60);
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
        },
        checkForNotification:function(){
            if(window.localStorage.notification == 'off'){
                return;
            }
            var timeNow= new Date();
            var notifyBefor=parseInt(window.localStorage.alertIn);
            TVGdb.Programs.getTodaysFollowedPrograms(function(list){
                for(i in list){
                    var programStartTime = new Date(list[i].sttime);
                    if(timeNow.getHours() == programStartTime.getHours() && (timeNow.getMinutes() == programStartTime.getMinutes()+notifyBefor)){
                        var notifier=new notification();
                        notifier.fireNotification(notifier.notificationTypes.webkit, list[i].title, 'سيبدأ بعد'+ notifyBefor +"دقيقة ",list[i].img, list[i].link, 30);
                    }
                }
            });
        }
    }
    TVbackground.doInBackGround();
    TVbackground.updatePrograms();
    return TVbackground;
}

$(function(){
    if(! window.localStorage.alertIn){
        window.localStorage.alertIn=10;
    }
    if(! window.localStorage.notification){
        window.localStorage.alertIn='on';
    }
})

var TVbackground = TVGBG();
/**
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callback Function The method to call when the request completes.
 */
function onRequest(request, sender, callback) {
    if(request.action=='updateChannelsPrograms'){
        window.setTimeout(function(){
            TVbackground.updatePrograms();
        }, 1000 * 5);
    }
    if(request.action == 'addNotification'){
        TVGdb.Programs.followProgram(request.message.programId, callback);
    }
    if(request.action == 'removeNotification'){
        TVGdb.Programs.unfollowProgram(request.message.programId, callback);
    }
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);