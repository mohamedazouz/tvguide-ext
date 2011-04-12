/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var background = chrome.extension.getBackgroundPage();
var tvguidepopup = function(){
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
                for( j in list){
                    out+='<div>';
                    if(list[j].img != null && list[j].img != ''){
                        out+='<a style="cursor:pointer;" onclick="tvguidepopup.openURL(\''+list[j].link+'\')" class="f"><img src="'+list[j].img+'" width="76" height="45"></a>';
                    }
                    out+='<div class="f film-details">';
                    out+='<div style="cursor:pointer;" onclick="tvguidepopup.addNotification('+list[j].id+')" title="أضف تنبية" class="f-r alert-icon"><img alt="أضف تنبية" src="images/alert_icon.png" width="26" height="25"></div>';
                    from = new Date(list[j].sttime);
                    to = new Date(list[j].endtime)
                    out+='<div class="f-r">من '+from.getHours()+':'+from.getMinutes()+'  الى '+to.getHours()+':'+to.getMinutes()+'</div>';
                    out+='<div class="film-name">';
                    out+='<strong><a style="cursor:pointer;" onclick="tvguidepopup.openURL(\''+list[j].link+'\')">';
                    out+=list[j].title;
                    out+='</a></strong>';
                    out+='</div>';
                    out+='<div>';
                    out+='  بطولة :  '+list[j].stars;
                    out+='</div>';
                    out+='</div>';
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
                $('#channelListTab').parent('li').addClass('active');
                tvguidepopup.selectedChannels();
            });
            $('#notificationTab').click(function(){
                $('.active').removeClass('active');
                $('#channelsList').hide();
                $('#programList').show();
                $("#backButton").show();
                $(this).parent('li').addClass('active');
            });
            $("#settingsPage").click(function(){
                extension.openOptionPage();
            })
        },
        /**
         * get selected channels from db and add them to the channel list tab.
         */
        selectedChannels:function(){
            if($('#channelsList').html() == ''){
                background.TVGdb.Channels.getActiveChannels(function(list){
                    if(list.length == 0){
                        $("#nochannels").show();
                        return;
                    }
                    $("#channelsList").html(tvguidepopup.HTMLGenerators.channelList(list));
                })
            }
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
                    setTodaysList();
                });
                $('#tomorrowsPrograms').bind('click', function(){
                    $("#programscontainer").html('');
                    setTomorrowsList();
                });
            });
            background.TVGdb.Programs.getTodayChannelPrograms(channelId,function(list){
                $("#programscontainer").html(tvguidepopup.HTMLGenerators.programList(list));
            });
            $("#channelsList").hide();
            $("#programList").show();
            $("#backButton").show();
        },
        addNotification:function(programId){
            chrome.extension.sendRequest({
                action:'addNotification',
                message:{programId:programId}
            })
        },
        /**
         * open a url in a new tab.
         */
        openURL:function(url){
            extension.openURL(url, false);
        }

    }
    $(function(){
        console.log($('#channelsList').text())
        tvguidepopup.selectedChannels();
        tvguidepopup.setDomEvents();
    });
    return tvguidepopup;
}

tvguidepopup =new tvguidepopup();
