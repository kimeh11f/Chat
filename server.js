var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var express = require('express');
var app = express();

app.use("/images", express.static(__dirname+'/images'));
app.use("/style", express.static(__dirname + '/style'));
app.use("/script", express.static(__dirname + '/script'));
//웹 서버 생성
var server = http.createServer(app).listen((process.env.PORT || 52273), function(){
    console.log('Server Running');
});

app.get('/', function(req, res){
    fs.readFile('main.html', function(error, data){
        res.writeHead(200, {'Content-Type' : 'text/html'});
        res.end(data);
    });
});


//소켓 서버 생성
var io = socketio.listen(server);
var id = 0;
var peopleCnt = 0;
io.sockets.on('connection', function (socket) {
    console.log(socket.id + " 접속 ("+ socket.request.connection.remoteAddress+")" );
    peopleCnt++;
    io.sockets.emit('setPeopleCnt', { peopleCnt: peopleCnt});
    //message 이벤트
    socket.on('message', function(data){
        //클라이언트의 message 이벤트를 발생시킵니다.
        console.log("아이디 : " + data.name + ", 내용 : " + data.message + ", 날짜 : " + data.date + "(" + socket.request.connection.remoteAddress +")"); 
        data.socketId = socket.id;
        io.sockets.emit('message', data);
    });

    socket.on('pushLocation', function (data) {
        //클라이언트의 message 이벤트를 발생시킵니다.
        console.log("latitude : " + data.latitude + ", longitude : " + data.longitude);
        id = socket.id;
        data.id = id;
        socket.broadcast.emit('addMarker', data);
    });

    socket.on('replyLocation', function (data) {
        //클라이언트의 message 이벤트를 발생시킵니다.
        if (id != 0) {
            io.sockets.to(id).emit('initMap', data);
        }
    });
    socket.on('closeMap', function (data) {
        //클라이언트의 message 이벤트를 발생시킵니다.
        socket.broadcast.emit('deleteMarker', data);
    });

    socket.on('disconnect', function () {
        peopleCnt--;
        console.log(socket.id + " 접속 종료 (" + socket.request.connection.remoteAddress + ")");
        //클라이언트의 message 이벤트를 발생시킵니다.
        socket.broadcast.emit('deleteMarker', {
            socketId: socket.id
        });
        io.sockets.emit('setPeopleCnt', { peopleCnt: peopleCnt });
    });
});
