String.prototype.toHtmlString = function (str){
    str = (str)? str: this;
    if(typeof str!="string") return "";
    var len = str.length;
    var output = "";
    for(var i=0; i<len; i++){
        switch(str[i]){
            case "\t":
                output += "&nbsp;&nbsp;&nbsp;&nbsp;"
                break;
            case "\n":
                output += "<br />";
                break;
            default:
                output += str[i];
        }
    }
    return output;
}