let express = require("express");
let app = express();
let server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
let server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
let server = app.listen(server_port,server_ip_address,function(){
    console.log( "Listening on " + server_ip_address + ", port " + server_port)
});
app.use(express.static('public'));
let socket = require("socket.io");
let io = socket(server);
io.sockets.on('connection',function(socket){
    socket.on('mouse',function(data){
        socket.broadcast.emit('mouse',data);
    });
});