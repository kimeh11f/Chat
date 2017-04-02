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
var io = socketio.listen(server, {
    'pingInterval': 2000,
    'pingTimeout': 2000
});
var id = 0;
var peopleCnt = 0;
//클라이언트가 연결되었을 때
io.sockets.on('connection', function (socket) {
    console.log(socket.id + " 접속 (" + socket.request.connection.remoteAddress + ")");
    peopleCnt++;
    io.sockets.emit('setPeopleCnt', { peopleCnt: peopleCnt});
    //연결된 클라이언트 전체에 broadcast
    socket.on('message', function(data){
        console.log("아이디 : " + data.name + ", 내용 : " + data.message + ", 날짜 : " + data.date + "(" + socket.request.connection.remoteAddress +")"); 
        data.socketId = socket.id;
        io.sockets.emit('message', data);
    });

    //나머지 클라이언트 전체에 broadcast
    socket.on('pushLocation', function (data) {
        console.log("latitude : " + data.latitude + ", longitude : " + data.longitude);
        id = socket.id;
        data.id = id;
        socket.broadcast.emit('addMarker', data);
    });

    //대상 소켓에 위치를 응답
    socket.on('replyLocation', function (data) {
        if (id != 0) {
            io.sockets.to(id).emit('initMap', data);
        }
    });

    //위치공유창 닫았을 때 marker삭제 이벤트 발생시킴.
    socket.on('closeMap', function (data) {
        socket.broadcast.emit('deleteMarker', data);
    });

    //소켓이 접속종료했을 때 접속자수 줄이고 marker삭제 이벤트 발생시킴.
    socket.on('disconnect', function () {
        peopleCnt--;
        console.log(socket.id + " 접속 종료 (" + socket.request.connection.remoteAddress + ")");
        
        socket.broadcast.emit('deleteMarker', {
            socketId: socket.id
        });
        io.sockets.emit('setPeopleCnt', { peopleCnt: peopleCnt });
    });
});