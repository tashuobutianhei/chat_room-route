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
    var router=express.Router();
    router.use(multipart({uploadDir:__dirname+'/public/upfile' }));//设置上传文件存放的地址


    router.use(bodyParser.urlencoded({ extended: false }));

    router.use(cookoeParser());//得先设置cookie
    router.use(cookieSession({ //session中间件
        name:'see', //session的名字
        maxAge: 2*3600*1000,
        keys:['aaa','bbb','ccc']//秘钥，循环使用  必选
    }));


    router.use((req, res, next)=>{
        if((!req.session['userId']) && (req.baseUrl!='/login'&&req.baseUrl!='/register' )){ //没有登录
            res.redirect('/login');
        }else{
            next();
        }
    });

    router.get('/login',function (req,res) {
        res.sendFile(path.resolve(__dirname+'/../public/loginall.html'),function (err) {
            if(err) console.log(err)
        })

    })

    router.get('/register',function (req,res) {
        res.sendFile(path.resolve(__dirname+'/../public/upfile.html'),function (err) {
            if(err)  console.log(err);
        });
    })

    router.get('/user',function (req,res) {
        res.sendFile(path.resolve(__dirname+'/../public/user.html'),function (err) {
            if(err)  console.log(err);
        });
    })

    router.get('/',function (req,res) {
        res.redirect('/login')
    })

    //注册
    router.post('/upfile',multipartMiddleware,function (req,res) {
        if(req.body.username==''||req.body.password==''){
            var data = {
                err: '不允许空信息'
            };
            res.send(JSON.stringify(data))
        }else{
            var sql ='select * from admin_table where username="' + req.body.username+'";';
            db.query(sql,function (err,data) {
                if(err){
                    console.log(err)
                }
                if(data){

                    if(data.length==0){
                        var url = path.parse(req.files.file.path).base;
                        var sql = 'insert  into admin_table(username,pasword,head) values (?,?,?)';
                        db.query(sql,[req.body.username,req.body.password,url], function (err, data) {
                            if (err) {
                                console.log(err)
                            } else {
                                if(data.length!=0){
                                    var data = {
                                        ok: '注册成功'
                                    };
                                    res.send(JSON.stringify(data))
                                }else{
                                    var data = {
                                        err: '用户名密码错误'
                                    }
                                    res.send(JSON.stringify(data))
                                }

                            }
                        })
                    }else{
                        var data = {
                            err: '账号已存在'
                        };
                        res.send(JSON.stringify(data))

                    }
                }
            })
        }

    })
    //登录   http://localhost:8081/login/updata/?want=register&aa=123456
    router.get('/login/updata',function (req,res) {
        if(req.query.want=='login') {
            var sql = 'select * from admin_table where username= ? and pasword = ?';
            db.query(sql,[req.query.user,req.query.password] ,function (err, data) {
                if (err) {

                } else {

                    if(data.length!=0){
                        console.log(req.query)
                        req.session['userId']=data[0].id;
                        var data2 = {
                            ok: '登录成功'
                        };



                        res.send(JSON.stringify(data2))

                        // var string = JSON.stringify(data2);
                        // res.send(req.query.callback+'('+string+')');

                    }else{
                        var data = {
                            err: '用户名密码错误'
                        }
                        res.send(JSON.stringify(data))
                    }

                }
            })
        }

    })
    //退出登陆
    router.get('/out',function (req,res) {
        delete req.session['userId'];
        res.send(JSON.stringify({res:'ok'}))

    })




    return router
}
