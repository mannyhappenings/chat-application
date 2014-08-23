var users = {};
var socket = io('http://172.16.102.11/');
var username = '';
var selectedUser = '';
socket.on('message', function (data) {
	console.log(data);
	if(!document.getElementById(data.username)){
		newChat(data.username);
	}
	document.getElementById(data.username).appendChild($('<div>' + data.username[0]+": "+data.message+'</div>')[0]);
});
socket.on('user-list', function(data){
	console.log(data);
	for(var x in data){
		if(!users[data[x]]){
			addUserList(data[x]);
			users[data[x]] = true;
		}
	}
});
function dec2hex(num){
	var hex = "";
    var temp;
	while(num){
        temp = num%16;
        hex = ((temp<10)? temp: String.fromCharCode(temp+87)) + hex;
		num = Math.floor(num/16);
	}
	return hex;
}
socket.on('user-exists', function(data){
	alertFade(data.username + " already on chat. For example, " + data.username + "-" + dec2hex(Math.floor(Math.random()*1000000)));
});
socket.on('announcement', function(data){
	alert(data.message);
});
socket.on('new user alert', function (data) {
	alertFade(data.username + " has entered the chatroom.");
	if(!users[data.username]) {
		addUserList(data.username);
		users[data.username] = true;
	}
});
socket.on('users', function(data){
	console.log(data);
});
socket.on("dis-connect", function(data){
	console.log(data);
	closeChat(data.username);
	if(data.username==username){
		disconnect();
	}
	users[data.username] = false;
});
socket.on('add-success', function(user){
	$("#add-user").hide();
	$("#input-box").show();
	$("#disconnect-button").show();
	username = user;
	document.title = username + "- Node JS prototype Application";
	document.getElementById("username").innerHTML = username;
});
window.onunload = function(){
	socket.emit('dis-connect', {username: username});
}

function disconnect() {
	socket.emit('dis-connect', {username: username});
	for( var x in users){
		console.log(x);
		closeChat(x);
		users[x] = false;
	}
	$("#add-user").show();
	$("#input-box").hide();
	$("#username").html("");
	$("#disconnect-button").hide();
	document.title = "Node JS prototype Application";
}

function alertFade(message){
	var div = $('<div style="position: fixed; top: 20px; left: 40%; background: #ffffff; border: 1px solid #ccc; padding: 10px;">'+message+'</div>');
	$(document.body).append(div);
	setTimeout(function(){
		div.fadeOut('slow', function(){
			document.body.removeChild(div[0]);
		});
	}, 1000);
}
function addUserList(user){
	var div = $('<div class="user" data="' + user + '">' + user + '</div>')[0];
	if(user == username){
		$(div).addClass('self');
		div.innerHTML += " &#10094;(its you)";
	}
	div.onclick = function() {
		// console.log(this.innerHTML);
		$('.user.selected').removeClass('selected');
		if($(this).attr("data")==selectedUser || $(this).attr("data")==username){
			selectedUser = "";
			return;
		}
		selectedUser = this.innerHTML;
		if(!document.getElementById(selectedUser))
			newChat(selectedUser);
		$(this).addClass('selected');
	};
	$(".available-users").append(div);
}
function getUsers(){
	socket.emit('getUser', null);
}


// HTML handlers
var temp;
function sendMessage(){
	var message = document.getElementById('message').value;
	if(selectedUser == ""){
		alertFade("Please select a user");
		return;
	}

	if(message == ""){
		alertFade("Please enter some message atleast.");
		return;
	}

	document.getElementById('message').value = "";
	document.getElementById(selectedUser).appendChild($('<div style="background-color: rgba(200, 200, 240, 0.4);">' + message+'</div>')[0]);
	socket.emit('message', {
				username: username, 
				message: message, 
				to: selectedUser
			});
}

var check = function(e, el) {
	temp = e;
	keyCode = e.keyCode||e.which;
	if(keyCode == 13){
		if(!e.shiftKey){
			e.preventDefault();
			sendMessage();
		}
	}
}

var newChat = function(user_name) {
	var div = $('<div class="chat-box"><h2 class="chat-name">'+user_name+'<span style="float: right;" class="chat-close-button" onclick="closeChatBox(\''+user_name+'\')">&#10060;</span></h2><div id="'+user_name+'" class="chat-messages"></div></div>');
	$("#chat-container").append(div);
}

var closeChatBox = function(user_name){
	if(document.getElementById(user_name)){
		var chatbox = $("#"+user_name)[0].parentNode;
		chatbox.parentNode.removeChild(chatbox);
		$("div.user.selected").removeClass("selected");
		selectedUser = "";
	}
}
var closeChat = function(user_name){
	console.log("Closing chat for "+user_name);
	closeChatBox(user_name);
	var userListItem = $("div[data='"+user_name+"'].user");
	if(userListItem.length){
		userListItem[0].parentNode.removeChild(userListItem[0]);
	}
}
var addUser = function() {
	var user = $("input[name='username']").val();
	if(user.trim()==""){
		alertFade("Enter your username");
		return;
	}
	alertFade(user);
	socket.emit('new user', {username: user});
}
