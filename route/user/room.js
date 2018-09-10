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

var multipartMiddleware = multipart();

var db=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1997123',
    database: 'node_test'
});

db.connect(function(err){
    if(err){

    }else{
        console.log('连接成功：')
    }
})


module.exports=function (){

    var router =express.Router();



    router.use(multipart({uploadDir:__dirname+'/../../public/upfile' }));//设置上传文件存放的地址


    router.use(bodyParser.urlencoded({ extended: false }));

    router.use(cookoeParser());//得先设置cookie
    router.use(cookieSession({ //session中间件
        name:'see', //session的名字
        maxAge: 2*3600*1000,
        keys:['aaa','bbb','ccc']//秘钥，循环使用  必选
    }));

//静态文件托管
    router.get('/room',function (req,res) {
        if(req.query.join){
            console.log(req.query.join)
            if(/^p123/.test(req.query.join)){
                sql = 'insert into room(roomname,roomnum) values(?,?);';
                db.query(sql,[req.query.join,2],function (err,data) {
                    if(err) console.log(err)
                })
            }


            var sql = 'select roomid,roomnum from room where roomname = ? ;';
            db.query(sql,req.query.join,function (err,data) {
                if(err){
                    console.log(err)
                }else{
                    string=JSON.stringify(data);
                    result = JSON.parse(string);

                    if(result.length==0){
                        res.send(JSON.stringify({
                            res:'no',
                        }))
                    }else{
                        var num = result[0].roomnum;
                        var sql = 'update room set roomnum = roomnum+1 where roomname = ?;'
                        db.query(sql,req.query.join,function (err,data) {
                            if(err){
                                console.log(err)
                            }else {
                                res.send(JSON.stringify({
                                    res:'ok',
                                    num:num+1
                                }))
                            }
                        })
                    }
                }
            })
        }else if(req.query.leave){
            var sql = 'update room set roomnum = roomnum-1 where roomname = ?;'
            db.query(sql,req.query.leave,function (err,data) {
                if(err){
                    console.log(err)
                }else{
                    sql = 'select roomnum from room where roomname = ? ;';
                    db.query(sql,req.query.leave,function (err,data) {
                        string=JSON.stringify(data);
                        result = JSON.parse(string);
                        console.log(result)
                        if(result[0].roomnum==0){
                            sql = 'delete from room where roomname = ? ;';
                            db.query(sql,req.query.leave,function (err,data) {
                                if(err){
                                    console.log(err);
                                }else{
                                    res.send(JSON.stringify({
                                        res:'noroom',
                                    }));
                                }
                            })
                        }else{
                            res.send(JSON.stringify({
                                res:'haveroom',
                            }))
                        }
                    })
                }
            })
        }
    })

    router.get('/create',function (req,res) {
        var sql = 'select roomid from room where roomname= ?';
        db.query(sql,req.query.room,function (err,data) {
            if(err){
                console.log(err)
            }else {
                string=JSON.stringify(data);
                result = JSON.parse(string);
                if(result.length==0){
                    var sql ='INSERT INTO room (roomname,roomnum) VALUES (?,?)';
                    db.query(sql,[req.query.room,1],function (err,data) {
                        if(err){
                            console.log(err)
                        }else {
                            res.send(JSON.stringify({
                                res:'ok',
                                roomname:req.query.room
                            }))

                        }
                    })
                }else{
                    res.send(JSON.stringify({
                        res:'no'
                    }))
                }

            }
        })
    })

    return router
}