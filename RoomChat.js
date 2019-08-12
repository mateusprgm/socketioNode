let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);




const getOnlineUsers = () => {
  let clients = io.sockets.clients().connected;

  let sockets = Object.values(clients);

  let users = sockets.map(s => s.username);
  users = users.filter(u => u != undefined);
  
  return users;
};

 const getOnlineUsersRoom = room => {
 	let numClients
 	
 		let clients = io.sockets.clients().connected;
		let client = io.sockets.adapter.rooms[room].sockets;
		numClients = (typeof client !== 'undefined') ? Object.keys(client).length : 0;
		console.log(numClients);
		
 	
 		return numClients;
 	

 	
  
};




io.on("connection", function(socket) {

 

  console.log("a user connected");

  socket.on('disconnect', function(){
  	if(socket.username!=undefined){
  		io.emit('users-changed', {user: socket.username, event: 'left', count:getOnlineUsers().length, users:getOnlineUsers(), exited:true});  
    	console.log(socket.username);
  	}
    
  });
 
  socket.on('set-name', (name) => {
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined', count:getOnlineUsers().length, users:getOnlineUsers()});  
  });


   socket.on("leave-room", function(room){
    console.log('[socket]','leave room :', room);
    io.emit('users-changed', {event: 'left', onUsersRoom: getOnlineUsersRoom(room), exited:false}); 
    console.log('aqui doido');
    socket.leave(room);
  })

    
  socket.on("join-room", function(room){
    socket.join(room);
    io.emit('users-changed', {event: 'joined', onUsersRoom: getOnlineUsersRoom(room)}); 
  });

  socket.on("send-message-room", ({ room, message }) => {
    console.log(message);
    socket.to(room).emit("message", {
      msg:message,
      user: socket.username,
      createdAt: new Date()
    });
  });




  socket.on("typing", ({ room }) => {
    socket.to(room).emit("typing", "Someone is typing");
  });

  socket.on("stopped_tying", ({ room }) => {
    socket.to(room).emit("stopped_tying");
  });




  



});

var port = process.env.PORT || 3001;

 
server.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});