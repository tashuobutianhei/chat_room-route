var express = require('express');


module.exports=function (){
    var router=express.Router();

    router.use((req, res, next)=>{
        if(!req.session['userId'] && (req.url!='/login'&&req.url!='/register' )){ //没有登录
            res.redirect('/login');
        }else{
            next();
        }
    });

    router.use('/room', require('./room')());
    router.use('/about', require('./about')());
    router.use('/friend', require('./friend')());

    return router
}