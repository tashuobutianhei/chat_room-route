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


module.exports=function () {
    var router = express.Router();
    router.use(multipart({uploadDir:__dirname+'/../../public/upfile' }));//设置上传文件存放的地址


    router.use(bodyParser.urlencoded({ extended: false }));

    router.use(cookoeParser());//得先设置cookie
    router.use(cookieSession({ //session中间件
        name:'see', //session的名字
        maxAge: 2*3600*1000,
        keys:['aaa','bbb','ccc']//秘钥，循环使用  必选
    }));

//信息
    router.get('/look',function (req,res) {
        var sql = 'select head,username,bg,describes from admin_table where id=?';
        db.query(sql,req.session['userId'],function(err,data){
            if(err){
                res.send('数据库错误').end();
            }else{
                // console.log(1)

                var string=JSON.stringify(data);
                var result = JSON.parse(string);
                result[0].head = 'http://localhost:8081/upfile/' + result[0].head;
                result[0].bg = 'http://localhost:8081/upfile/' + result[0].bg;


                sql = 'select userid,friendid,status from friend where userid = ?'
                db.query(sql,req.session['userId'],function(err,data){
                    if(err){

                    }else{
                        var string=JSON.stringify(data);
                        data2 = JSON.parse(string);

                        var friend = [];

                        if(data2.length==0){
                            result[0].friend = friend;
                            res.send(JSON.stringify(result[0]))
                        }else{
                            console.log(666)
                            data2.forEach(function (item,index,arr) {
                                sql = 'select head,username from admin_table where id=?';
                                db.query(sql,item.friendid,function(err,datas){
                                    if(err){
                                        console.log(4)
                                    }else{
                                        sql = 'select roomname,roomnum from room ';
                                        db.query(sql,function(err,data){
                                            if(err){
                                                console.log(5)
                                            }else {
                                                strings=JSON.stringify(data);
                                                data4 = JSON.parse(strings);


                                                string=JSON.stringify(datas);
                                                data3 = JSON.parse(string);
                                                data3[0].head = 'http://localhost:8081/upfile/' + data3[0].head;
                                                data3[0].status = item.status;

                                                friend.push(data3[0]);
                                                result[0].friend = friend;
                                                result[0].list = data4

                                                if(index == arr.length-1){
                                                    res.send(JSON.stringify(result[0]))
                                                }
                                            }

                                        })

                                    }

                                })

                            })
                        }

                    }

                })


            }
        })

    })

//更换背景
    router.post('/upbg',multipartMiddleware,function (req,res) {
        //console.log(req.body)
        var url = path.parse(req.files.file.path).base;
        var sql = 'update   admin_table set bg = ? where id = ?';
        db.query(sql,[url,req.session['userId']], function (err, data) {
            if (err) {
                console.log(err)
            } else {
                if(data.length!=0){
                    var src = 'http://localhost:8081/upfile/' + url;
                    var data = {
                        ok: '更换成功',
                        src:src
                    };
                    res.send(JSON.stringify(data));
                }else{
                    var data = {
                        err: '错误'
                    }
                    res.send(JSON.stringify(data))
                }

            }
        })
    })


    router.get('/change',function (req,res) {
        console.log(req.query)
        if(req.query.username){
            var sql = 'select id from admin_table where username = ?'
            db.query(sql,req.query.username,function (err,data) {
                if(err){
                    console.log(err)
                }else{
                    data = JSON.parse(JSON.stringify(data));
                    if(data.length==0){
                        //可以修改
                        var sql = 'update admin_table set username = ? where username = ?'
                        db.query(sql,[req.query.username,req.query.user],function (err,data) {
                            if(err){
                                console.log(err)
                            }else {
                                res.send(JSON.stringify({
                                    res:'ok'
                                }))
                            }
                        })

                    }else{
                        //有重复的
                        res.send(JSON.stringify({
                            res:'no'
                        }))
                    }
                }
            })
        }else if(req.query.password){
            var sql = 'update admin_table set pasword = ? where username = ?';
            db.query(sql,[req.query.password,req.query.user],function (err,data) {
                if(err){
                    console.log(err)
                }else {
                    res.send(JSON.stringify({
                        res:'ok'
                    }))
                }
            })
        }else{
            var sql = 'update admin_table set describes = ? where username = ?;';
            db.query(sql,[req.query.describe,req.query.user],function (err,data) {
                if(err){
                    console.log(err)
                }else {
                    res.send(JSON.stringify({
                        res:'ok'
                    }))
                }
            })
        }
    })

    return router


}
