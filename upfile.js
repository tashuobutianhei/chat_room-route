var fs = require('fs');
var http = require('http');
var socketIo=require("socket.io");
var express = require('express');
var path = require('path')
var cookoeParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var mysql=require('mysql');
var multipart = require('connect-multiparty');

var db=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1997123',
    database: 'node_test'
});

db.connect(function(err){
    if(err){

    }else{
        console.log('连接成功：嗯')
    }
})

var server = express();

server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookoeParser());//得先设置cookie
server.use(cookieSession({ //session中间件
    name:'see', //session的名字
    maxAge: 2*3600*1000,
    keys:['aaa','bbb','ccc']//秘钥，循环使用  必选
}));

server.use(express.static('public'));


var servers=http.createServer(server);

var io=socketIo(servers);//将socket.io注入express模块

io.on('connection',function (Socket) {
    Socket.on("join",function (data,fn) {
        Socket.join(data.roomName); // join(房间名)加入房间
        // fn({"code":0,"msg":"加入房间成功","roomName":data.roomName});
    });
    Socket.on("leave",function (data,fn) {
        Socket.leave(data.roomName);//leave(房间名) 离开房间
        // fn({"code":0,"msg":"已退出房间","roomName":data.roomName});
    });
    Socket.on("sendMsg",function (data,fn) {
        Socket.broadcast.to(data.roomName).emit("receiveMsg",data);
        //fn({"code":0,"msg":"消息发生成功"});
    });
    Socket.on("private",function (data,fn) {
        console.log(data)
        var sql ='select id from admin_table where username = ? ';
        db.query(sql,data.friend, function (err, data1){
            if(err){
                console.log('62')
            }else{
                var string=JSON.stringify(data1);
                var result = JSON.parse(string);

                data.friendid = result[0].id
                db.query(sql,data.client, function (err, data2){
                    if(err){
                        console.log('63')
                    }else{

                        string=JSON.stringify(data2);
                        result = JSON.parse(string);
                        data.userid =  result[0].id;
                        //console.log(data)
                        io.sockets.emit("privateMsg",data);
                    }
                })
            }
        })

    })
})

//静态文件托管;

server.use('/user/', require('./route/user/user.js')());
server.use('/login/', require('./route/login.js')())

servers.listen(8081);