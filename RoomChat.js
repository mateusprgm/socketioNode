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




io.on("connection", function(socket) {


  console.log("a user connected");

  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.username, event: 'left', count:getOnlineUsers().length, users:getOnlineUsers()});  
  });
 
  socket.on('set-name', (name) => {
    socket.username = name;
    io.emit('users-changed', {user: name, event: 'joined', count:getOnlineUsers().length, users:getOnlineUsers()});  
  });


  socket.on("leave-room", function(room){
    console.log('[socket]','leave room :', room);
    console.log(socket);
    socket.leave(room);
  })

    
  socket.on("join-room", room => {
    socket.join(room);
    console.log(room);
    io.to(room).emit('a new user has joined the room');

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