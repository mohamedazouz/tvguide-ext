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
                    out+='<li class="f">';
                    out+='<div style="display:none;">'+list[i].name+'</div>'
                    out+='<img alt="'+list[i].name+'" src="'+list[i].opimg+'" />';
                    if(selected){
                        out+='<input name="" type="checkbox" checked="true" value="'+list[i].id+'">';
                    }else{
                        out+='<input name="" type="checkbox" value="'+list[i].id+'">';
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
                });
            });
        }
    }
    $(function(){
        tvgoptions.populateChannelList();
    });
    return tvgoptions;
}
var tvgoptions=new TVGOptions();
