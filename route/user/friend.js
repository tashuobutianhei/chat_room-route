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
//-1,,拉黑，0。发送待审核，1.正常 -2.收到待审核
    router.get('/findFriend',function (req,res) {
        var sql = 'select id from admin_table where username=?';
        db.query(sql,req.query.username,function(err,data){
            if(err){
                res.send('数据库错误').end();
            }else{
                if(data.length==0){
                    res.send(JSON.stringify({
                        err:'查无此人'
                    }))
                }else{
                    console.log(data)
                    var string=JSON.stringify(data);
                    var result = JSON.parse(string);

                    var friendid = result[0].id;

                    var sql = 'select status from friend where userid=? and friendid = ?';
                    db.query(sql,[req.session['userId'],friendid],function(err,data){
                        if(err){
                            res.send('数据库错误').end();
                        }else{
                            console.log(data)
                            if(data.length==0){
                                //没发送过
                                var sql1 = 'insert into friend(userid,friendid,status) values(?,?,?)';
                                db.query(sql1,[req.session['userId'],friendid,0],function (err,data) {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        db.query(sql1,[friendid,req.session['userId'],-2],function (err,data) {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                res.send(JSON.stringify({
                                                    res:'请求发送成功，请等待回复'
                                                }))
                                            }
                                        })
                                    }
                                })
                            }else{
                                //已经发送过请求
                                res.send(JSON.stringify({
                                    res:'已发送申请，请等待'
                                }))
                            }
                        }
                    })
                }

            }
        })

    })

//删除和拒绝
    router.get('/refuseFriend',function (req,res) {
        var sql = 'select id from admin_table where username = ?';
        db.query(sql,req.query.username, function (err, data) {
            if(err){
                console.log(err)
            }else {
                var string=JSON.stringify(data);
                var data = JSON.parse(string);
                var id = data[0].id;

                sql = 'DELETE FROM friend where userid = ? and friendid = ?'
                db.query(sql,[id,req.session['userId']], function (err, data) {
                    if(err){
                        console.log(err)
                    }else{
                        db.query(sql,[req.session['userId'],id], function (err, data) {
                            if(err){
                                console.log(err)
                            }else{
                                res.send(JSON.stringify({
                                    res:'ok'
                                }))
                            }
                        })
                    }
                })

            }
        })
    })

//同意添加
    router.get('/allowFriend',function (req,res) {

        var sql = 'select id from admin_table where username = ?';
        db.query(sql,req.query.username, function (err, data) {
            if(err){
                console.log(err)
            }else {
                var string=JSON.stringify(data);
                var data = JSON.parse(string);
                var id = data[0].id;

                sql = 'update friend  set status = 1 where userid = ? and friendid = ?'
                db.query(sql,[id,req.session['userId']], function (err, data) {
                    if(err){
                        console.log(err)
                    }else{
                        db.query(sql,[req.session['userId'],id], function (err, data) {
                            if(err){
                                console.log(err)
                            }else{
                                res.send(JSON.stringify({
                                    res:'ok'
                                }))
                            }
                        })
                    }
                })

            }
        })
    })

    router.get('/findFriendsUnique',function (req,res) {
        var sql = 'select status from friend where userid=? ande friendid =?'
        db.query(sql,[req.query.name,req.query.friendName],function (err,data) {
            if(err){

            }else{
                data = JSON.parse(JSON.stringify(data));

                if(data.length==0){
                    req.send(JSON.stringify({
                        res:'noThisFriend'
                    }))
                }else{
                    req.send(JSON.stringify({
                        res:'haveThisFriend'
                    }))
                }
            }
        })
    })
    return router

}
