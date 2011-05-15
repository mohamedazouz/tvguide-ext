/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var background = chrome.extension.getBackgroundPage();
var TVGuidePopup = function(){
    var tvguidepopup={
        HTMLGenerators:{
            channelList:function(list){
                var out='<ul>';
                for( l in list){
                    out+='<li style="cursor:pointer;" title="'+list[l].name+'" class="f">';
                    out+='<a onclick="tvguidepopup.openChannel('+list[l].id+')">';
                    out+='<img src="'+list[l].img+'" alt="'+list[l].name+'">';
                    out+='</a></li>';
                }
                out+='</ul>';
                return out;
            },
            programList:function(list){
                var out='';
                var country=JSON.parse(window.localStorage.country);
                for( j in list){
                    from = new Date(list[j].sttime);
                    to = new Date(list[j].endtime);
                    date = new Date();
                    if((to.getTime()+to.getTimezoneOffset()*60*1000) < (date.getTime() + date.getTimezoneOffset() * 60 * 1000 ) ){
                        continue;
                    }
                    out+='<div>';
                    if(list[j].img != null && list[j].img != ''){
                        out+='<a style="cursor:pointer;" onclick="tvguidepopup.openURL(\''+list[j].link+'\')" class="f"><img src="'+list[j].img+'" width="76" height="45"></a>';
                        out+='<div class="f film-details">';
                    }else{
                        out+='<div class="f film-details-imageless">';
                    }
                    if(list[j].follow == 'true'){
                        out+='<div style="cursor:pointer;" onclick="tvguidepopup.removeNotification('+list[j].id+',this)" title="احذف تنبية" class="f-r alert-icon"><img alt="احذف تنبية" src="images/close.png" width="26" height="25"></div>';
                    }else if((from.getTime()+from.getTimezoneOffset()*60*1000) > (date.getTime() + date.getTimezoneOffset() * 60 * 1000 )){
                        out+='<div style="cursor:pointer;" onclick="tvguidepopup.addNotification('+list[j].id+',this)" title="أضف تنبية" class="f-r alert-icon"><img alt="أضف تنبية" src="images/alert_icon.png" width="26" height="25"></div>';
                    }
                    out+='<div class="f-r">من '+((from.getUTCHours() + country.timeZone)%24)+':'+from.getMinutes()+'  الى '+((to.getUTCHours() + country.timeZone)%24)+':'+to.getMinutes()+'</div>';
                    out+='<div class="film-name">';
                    out+='<strong><a style="cursor:pointer;" onclick="tvguidepopup.openURL(\''+list[j].link+'\')">';
                    out+=list[j].title;
                    out+='</a></strong>';
                    out+='</div>';
                    out+='<div>';
                    if(list[j].stars && list[j].stars != '')
                        if(list[j].category == 'برامج'){
                            out+='  تقديم :  '+list[j].stars;
                        }else{
                            out+='  بطولة :  '+list[j].stars;
                        }
                    out+='</div>';
                    out+='</div>';
                    out+='<div class="nl"></div>';
                    out+='</div>';
                    out+='<div class="separator"></div>';
                }
                return out;
            },
            notificationList:function(list){
                var out='';
                var country=JSON.parse(window.localStorage.country);
                for(h in list){
                    out+='<div id="program-'+list[h].id+'">';
                    if(list[h].img != null && list[h].img != ''){
                        out+='<a style="cursor:pointer;" onclick="tvguidepopup.openURL(\''+list[h].link+'\')" class="f"><img src="'+list[h].img+'" width="76" height="45"></a>';
                        out+='<div class="f film-details">';
                    }else{
                        out+='<div class="f film-details-imageless">';
                    }
                    from = new Date(list[h].sttime);
                    to = new Date(list[h].endtime)
                    out+='<div class="f-r"> يوم'+from.getDate()+" - "+(from.getMonth()+1)+' من '+((from.getUTCHours() + country.timeZone)%24)+':'+from.getMinutes()+'  الى '+((to.getUTCHours() + country.timeZone)%24)+':'+to.getMinutes()+'</div>';
                    out+='<div class="film-name">';
                    out+='<strong><a style="cursor:pointer;" onclick="tvguidepopup.openURL(\''+list[h].link+'\')">';
                    out+=list[h].title;
                    out+='</a></strong>';
                    //                    out+='<div class="f channels-name"></div>';
                    out+='</div>';
                    out+='</div>';
                    out+='<div style="cursor:pointer;" onclick="tvguidepopup.removeNotificationFromTab('+list[h].id+',this)" title="احذف تنبية" class="f-r alert-icon"><img alt="احذف تنبية" src="images/close.png" width="26" height="25"></div>';
                    out+='<div class="nl"></div>';
                    out+='</div>';
                    out+='<div class="separator"></div>';
                }
                return out;
            }
        },
        /**
         * setting dom events on the html elements.
         */
        setDomEvents:function(){
            $('#channelListTab, #backButton').click(function(){
                $('.active').removeClass('active');
                $('#channelsList').show();
                $("#backButton").hide();
                $('#programList').hide();
                $('#notificationList').hide();
                $('#channelListTab').parent('li').addClass('active');
                tvguidepopup.selectedChannels();
                $("#nofollowed").hide();
            });
            $('#notificationTab').click(function(){
                tvguidepopup.showNotificationList();
                $('.active').removeClass('active');
                $('#channelsList').hide();
                $('#notificationList').show();
                $('#programList').hide();
                $("#backButton").show();
                $('#notificationTab').parent('li').addClass('active');
            });
            $("#settingsPage , #settingsPage1").click(function(){
                extension.openOptionPage();
            });
        },
        /**
         * get selected channels from db and add them to the channel list tab.
         */
        selectedChannels:function(){
            if($('#channelsList').html().indexOf('TV_loader.gif') != -1){
                background.TVGdb.Channels.getActiveChannels(function(list){
                    if(list.length == 0){
                        $("#nochannels").show();
                        $("#channelsList").hide();
                        return;
                    }
                    $("#channelsList").html(tvguidepopup.HTMLGenerators.channelList(list));
                })
            }
        },
        showNotificationList:function(){
            background.TVGdb.Programs.getFollowedProgramsOrderd(function(list){
                if(list.length == 0){
                    $("#nofollowed").show();
                    return;
                }
                $("#notificationList").html(tvguidepopup.HTMLGenerators.notificationList(list));
            })
        },
        /**
         * open channel programs 
         */
        openChannel:function(channelId){
            function setTodaysList(){
                background.TVGdb.Programs.getTodayChannelPrograms(channelId,function(list){
                    $("#programscontainer").html(tvguidepopup.HTMLGenerators.programList(list));
                });
            }
            function setTomorrowsList(){
                background.TVGdb.Programs.getTomorrowChannelPrograms(channelId,function(list){
                    $("#programscontainer").html(tvguidepopup.HTMLGenerators.programList(list));
                });
            }
            background.TVGdb.Channels.getChannel(channelId, function(channel){
                $("#channelLogo").attr('src',channel.img);
                $("#channelLogo").attr('alt',channel.name);
                $('#todaysPrograms').bind('click', function(){
                    $(".activeProgram").removeClass("activeProgram");
                    $(this).addClass("activeProgram");
                    setTodaysList();
                });
                $('#tomorrowsPrograms').bind('click', function(){
                    $(".activeProgram").removeClass("activeProgram");
                    $(this).addClass("activeProgram");
                    $("#programscontainer").html('');
                    setTomorrowsList();
                });
            });
            $('#todaysPrograms').addClass("activeProgram");
            background.TVGdb.Programs.getTodayChannelPrograms(channelId,function(list){
                $("#programscontainer").html(tvguidepopup.HTMLGenerators.programList(list));
            });
            $("#channelsList").hide();
            $("#programList").show();
            $("#backButton").show();
        },
        addNotification:function(programId,triggerEl){
            chrome.extension.sendRequest({
                action:'addNotification',
                message:{
                    programId:programId
                }
            },function(){
                $(triggerEl).children('img').attr('src','images/close.png');
                $(triggerEl).unbind('click');
                $(triggerEl).bind('click',function(){
                    tvguidepopup.removeNotification(programId, triggerEl);
                });
            });
        },
        removeNotification:function(programId,triggerEl){
            chrome.extension.sendRequest({
                action:'removeNotification',
                message:{
                    programId:programId
                }
            },function(){
                $(triggerEl).children('img').attr('src','images/alert_icon.png');
                $(triggerEl).unbind('click');
                $(triggerEl).bind('click',function(){
                    tvguidepopup.addNotification(programId, triggerEl);
                });
            });
        },
        removeNotificationFromTab:function(programId,triggerEl){
            chrome.extension.sendRequest({
                action:'removeNotification',
                message:{
                    programId:programId
                }
            },function(){
                $('#program-'+programId).fadeOut('slow');
                $('#program-'+programId).next('.separator').fadeOut('slow');
                window.setTimeout(function(){
                    $('#program-'+programId).remove();
                    $('#program-'+programId).next('.separator').remove();
                }, 1000);
            });
        },
        /**
         * open a url in a new tab.
         */
        openURL:function(url){
            extension.openURL(url, false);
        }

    }
    $(function(){
        tvguidepopup.selectedChannels();
        tvguidepopup.setDomEvents();
        if(! window.localStorage.country){
            Positioning.getPosition(function(ob){
                Positioning.geonamesVars(ob.lat,ob.lng,function(co){
                    country=background.countries[co.countryName];
                    window.localStorage.country =JSON.stringify(country);
                });
            });
        }
    });
    return tvguidepopup;
}

tvguidepopup =new TVGuidePopup();
var Positioning =background.Positioning;