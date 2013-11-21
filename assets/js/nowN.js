var urlarray = window.location.href.split("/");
var peer = new Peer({host: '172.16.125.144', port: 2368, debug: 3, nickname: urlarray[urlarray.length-2],
config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' },
    { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
  ]}});
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var localStreamReady = false;
var connectedPeers = {};
var user = [];
var count = 0;
var now = {
			id : null,
			addUser: null,
			gotReady : false,
			ready : function(callback) {
				
			},
			sendOpBatch : function(aa, ab, ac) {
				for (var key in connectedPeers) {
					var conn = connectedPeers[key];
					conn.send(ab);
				}
				if (ac) {
					ac();
				}
			},
			getConnNum : function() {
				return count;
			},
			joinBoard : function(aa, ab) {
				var conn = peer.connect(aa);
				conn.on('open', function() {
					connectedPeers[aa] = conn;
					count++;
					conn.on('data', function(data) {
						now.receiveOplog(data, null);
					});
				});
				conn.on('error', function(err){
					alert('DataConnect Error!');
				});
				conn.on('close', function(){
					delete connectedPeers[conn.peer];
				});
				/*
				navigator.getUserMedia({audio: true}, function(stream) {
					var call = peer.call(aa, stream);
					call.on('stream', function(remoteStream) {
					//	var audio = document.getElementById("localAudio"); //document.querySelector("localAudio");
					//	audio.src = window.URL.createObjectURL(remoteStream);
						//audio.play();
						var audioContext = new AudioContext();
						//var mediaStreamSource = audioContext.createMediaStreamSource(remoteStream);
						//mediaStreamSource.connect(audioContext.destination);
						var source = audioContext.createBufferSource();
						source.buffer = remoteStream.getAudioTracks();
						source.connect(context.destination);
						source.start(0); 
					});
					}, function(err) {
					console.log('Failed to get local stream' ,err);
				});*/
			},
			audioCall : function(aa, ab) {
				
				var call  = peer.call(aa, window.localStream);
				call.on('stream', function(stream){
					if(ab){
						ab(true);
					}
				});
				call.on('error', function(err){
					if(ab){
						ab(false);
					}
				});
				
			}
	
};
peer.on('open', function(id){
  now.id = id;
  window.location.hash = now.id;
  now.gotReady = true;
});

peer.on('newuser', function(id, nickname){
//alert("new user: "+id+", "+nickname);
  if (now.addUser) {
  //alert("IF new user: "+id+", "+nickname);
	now.addUser.call(this, nickname, id);
	return;
  }else {
	user.push({uid: id, name: nickname});
	
  }
});

peer.on('error', function(err){
	peer.destroy();
	peer = null;
	now = null;
    alert('Init Failed. Error: '+err.message);
});
	
peer.on('connection', function(conn) {
		
		if (!connectedPeers[conn.peer]) {
			connectedPeers[conn.peer] = conn;
		} else{
			return;
		};
		conn.on('data', function(data) {
			now.receiveOplog(data, null);
		});
		
});
// Receiving a call
peer.on('call', function(call){
	navigator.getUserMedia({audio: true}, function(stream) {
		call.answer(stream); 
		call.on('stream', function(remoteStream) {
			//var audio = document.getElementById("localAudio"); //document.querySelector("localAudio");
			//audio.src = window.URL.createObjectURL(remoteStream);
			//audio.play();
			//console.log(''+remoteStream);
			var audioContext = new AudioContext();
		//	var mediaStreamSource = audioContext.createMediaStreamSource(remoteStream);
		//	mediaStreamSource.connect(audioContext.destination);
			var source = audioContext.createBufferSource();
                                                source.buffer = remoteStream.getAudioTracks();
                                                source.connect(context.destination);
                                                source.start(0);
		});
		}, function(err) {
		console.log('Failed to get local stream' ,err);
	});
});



