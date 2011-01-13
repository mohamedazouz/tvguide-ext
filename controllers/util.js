/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var util={
    clone:function (o) { // shallow clone
        var clone = {};
        for (var key in o) {
            clone[key] = o[key];
        }
        return clone;
    },
    cutText:function(text,lenght){
        for( i =0 ; i< 20 ; i++){
            if(text.charAt( lenght) != " "){
                lenght++;
            }else{
                i=20;
            }
        }
        return text.substring(0, lenght)+" ...";
    },
    selectedRows:function(){
        var checked=[];
        $(':checkbox').each(function(){
            if(this.checked){
                checked.push(this.value);
            }
        });
        return checked;
    },
    reverseString:function(str){
        var i=str.length;
        i=i-1;
        var revstr=""
        for (var x = i; x >=0; x--)
        {
            revstr+=str.charAt(x);
        }
        return revstr;
    },
    replaceAll:function(str,match,replace){
        var i=str.length;
        i=i-1;
        var revstr=""
        for (var x = i; x >=0; x--)
        {
            revstr+=(str.charAt(x)==match?replace:str.charAt(x));
        }
        return revstr;
    }
}