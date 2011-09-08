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
            },
            countriesSelect:function(){
                var out="";//country
                for(i in countries){
                    out+='<option id="'+countries[i].en+'" value="'+countries[i].id+'">'+countries[i].ar+'</option>';
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
                    $('li.channelLI input').change(function(e){
                        channelId=this.id;
                        $('#'+channelId).attr('checked',! $('#'+channelId).attr('checked'));
                    });
                });
            });
        },
        setDomEvents:function(){
            if(! window.localStorage.notification){
                window.localStorage.notification = "off";
            }
            if(! window.localStorage.alertIn){
                window.localStorage.alertIn = 0;
            }
            $("#notificationControll").val(window.localStorage.notification);
            $("#notificationControll").change(function(){
                window.localStorage.notification=this.value;
                if(this.value == 'on'){
                    $('#alertForOption').show();
                    if(window.localStorage.alertIn !="30" && window.localStorage.alertIn !="60" &&window.localStorage.alertIn !="120" &&window.localStorage.alertIn !="45" ){
                        $("#chooseAlertdiv").show();
                        $('#alertFor').val('1');
                        $("#chooseAlert").attr('value', window.localStorage.alertIn);
                    }else{
                        $('#alertFor').val(window.localStorage.alertIn);
                    }
                }else{
                    $("#chooseAlertdiv").hide();
                    $('#alertForOption').hide();
                }
            });

            if(window.localStorage.notification == 'on'){
                $('#alertForOption').show();
            }else{
                $('#alertForOption').hide();
            }
            if(window.localStorage.alertIn !="30" && window.localStorage.alertIn !="60" &&window.localStorage.alertIn !="120" &&window.localStorage.alertIn !="45" ){
                $('#alertFor').val('1');
                $("#chooseAlert").attr('value', window.localStorage.alertIn);
            }else
            {
                $("#chooseAlertdiv").hide();
                $('#alertFor').val(window.localStorage.alertIn);
            }
            
            $('#alertFor').change(function(){
                if(this.value==1){
                    $("#chooseAlertdiv").show()
                    $("#chooseAlert").attr('value', window.localStorage.alertIn);
                }else{
                    $("#chooseAlertdiv").hide()
                    window.localStorage.alertIn=this.value;
                }
            });
            $('#chooseAlert').change(function(){
                window.localStorage.alertIn=this.value;
            })
            $('#channelview').change(function(){
                window.localStorage.channelView=this.value;
            })
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
            $("#country").html(tvgoptions.htmlMethods.countriesSelect());
            $("#country").change(function(e){
                countryChanged(this.value);
            })
            var country = null;
            if(window.localStorage.country){
                country = JSON.parse(window.localStorage.country);
                selectCountry(country.en);
            }else{
                Positioning.getPosition(function(ob){
                    Positioning.geonamesVars(ob.lat,ob.lng,function(co){
                        country=co.countryName;
                        selectCountry(country);
                    });
                });
            }
            function selectCountry(country){
                $("#"+country).attr('selected',true);
                countryChanged($("#"+country).val());
            }
            function countryChanged(val){
                for(i in countries){
                    if(countries[i].id == val){
                        window.localStorage.country = JSON.stringify(countries[i]);
                    }
                }
            }
        }
    }
    $(function(){
        tvgoptions.populateChannelList();
        tvgoptions.setDomEvents();
        $("#channelview").val(window.localStorage.channelView);
    });
    return tvgoptions;
}
var tvgoptions=new TVGOptions();
var Positioning =background.Positioning;
