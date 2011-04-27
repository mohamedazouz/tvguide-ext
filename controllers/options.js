/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var background=chrome.extension.getBackgroundPage();
var TVGOptions=function(){
    var tvgoptions={
        htmlMethods:{
            createChannelList:function(list,selected){
                var out="";
                for(i in list){
                    //only for testing
                    if(list[i].opimg.indexOf('.png', 0)==-1){
                        continue;
                    }
                    out+='<li style="cursor:pointer;" id="channel-'+list[i].id+'" class="f channelLI">';
                    out+='<div style="display:none;">'+list[i].name+'</div>'
                    out+='<img alt="'+list[i].name+'" src="'+list[i].opimg+'" />';
                    if(selected){
                        out+='<input name="" id="channelin-'+list[i].id+'" type="checkbox" checked="true" value="'+list[i].id+'">';
                    }else{
                        out+='<input name="" id="channelin-'+list[i].id+'" type="checkbox" value="'+list[i].id+'">';
                    }
                    out+='</li>';
                }
                return out;
            }
        },
        populateChannelList:function(){
            background.TVGdb.Channels.getActiveChannels(function(list){
                $("#channelList").html(tvgoptions.htmlMethods.createChannelList(list,true));
                background.TVGdb.Channels.getInactiveChannels(function(list){
                    $("#channelList").append(tvgoptions.htmlMethods.createChannelList(list));
                    $("input#quicksearch").quicksearch("ul#channelList li");
                    $('li.channelLI').click(function(e){
                        channelId=this.id.substr(8);
                        $('#channelin-'+channelId).attr('checked',! $('#channelin-'+channelId).attr('checked'));
                        if($('#channelin-'+channelId).attr('checked'))
                            background.TVGdb.Channels.activateChannel(channelId, function(){});
                        else
                            background.TVGdb.Channels.deactivateChannel(channelId, function(){
                                background.TVGdb.Programs.deleteChannelPrograms(channelId, function(){});
                            });
                    });
                });
            });
        },
        setDomEvents:function(){
            $("#notificationControll").val(window.localStorage.notification);
            $("#notificationControll").change(function(){
                window.localStorage.notification=this.value;
                if(this.value == 'on'){
                    $('#alertForOption').show();
                }else{
                    $('#alertForOption').hide();
                }
            });

            if(window.localStorage.notification == 'on'){
                $('#alertForOption').show();
            }else{
                $('#alertForOption').hide();
            }

            $('#alertFor').val(window.localStorage.alertIn);
            $('#alertFor').change(function(){
                window.localStorage.alertIn=this.value;
            });
            $("#saveButton").click(function(){
                chrome.extension.sendRequest({
                    action:'updateChannelsPrograms'
                });
                $('<div class="save-popup">تم الحفظ</div>')
                .insertAfter( $(this) )
                .fadeIn('slow')
                .animate({
                    opacity: 1.0
                }, 3000)
                .fadeOut('slow', function() {
                    $(this).remove();
                });
            });
        }
    }
    $(function(){
        tvgoptions.populateChannelList();
        tvgoptions.setDomEvents();
    });
    return tvgoptions;
}
var tvgoptions=new TVGOptions();