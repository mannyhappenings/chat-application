exports.members = function(obj) {
	var str = "{\n";
	for(var x in obj) {
		try{
			str +=  "\t"+ typeof obj[x] +" "+ x + "\n ";
		} catch(e){
			console.error("Exception occured at line 5 in utilities.js", e);
		}
		// console.log("\t"+ typeof obj[x] +" "+ x + "\n ");
	}
	str += "}";
	return str;
}
exports.clog = function(msg){
	console.log(msg);
}