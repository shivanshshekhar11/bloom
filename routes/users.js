var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var async = require('async');

/* GET users listing. */
router.get('/', function(req, res, next) {
    if(req.user.status == 'admin' || req.user.status == 'member'){
        User.find({}, function(err, users){
            if(err){
                return next(err);
            }
            res.render("users", {title: "All users", user_list: users});
        })
    }
    else{
        res.redirect("/posts");
    }
});

router.get("/:username", function(req, res, next){

    if(req.user.status == 'admin' || req.user.status == 'member'){

        async function getUser(req, res, next){
            var quser = await User.find({username: req.params.username});

            if (quser[0]==null) { // No results.
                var err = new Error('User not found');
                err.status = 404;
                return next(err);
            }
        
            Post.find({'author': quser[0]._id })
                .exec(function(err, posts) {
        
                    if (err) { return next(err); }
                    
                // Successful, so render
                res.render('user', { title: quser[0].username, quser: quser[0], user_posts: posts } );
            });
        }

        getUser(req, res, next);
    }

    else{
        res.redirect("/posts");
    }
})

router.get("/:username/delete", function(req, res, next){

    if(req.user.status == 'admin'){

        async function getUser(req, res, next){
            var quser = await User.find({username: req.params.username});

            if (quser[0]==null) { // No results.
                var err = new Error('User not found');
                err.status = 404;
                return next(err);
            }

            if (quser[0].status == 'admin') {
                var err = new Error('You cannot delete yourself');
                err.status = 500;
                return next(err);
            }
        
            Post.deleteMany({'author': quser[0]._id })
                .exec(function(err) {
        
                    if (err) { return next(err); }
            });

            User.deleteOne({username: quser[0].username});
                
            res.redirect("/users");
        }

        getUser(req, res, next);
    }

    else{
        res.redirect("/posts");
    }
})

module.exports = router;
