var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');

const { body,validationResult } = require('express-validator');

router.get("/", function(req, res, next) {

    Post.find({})
    .sort({createdAt : -1})
    .populate("author")
    .exec(function (err, posts) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('posts', { title: 'All Posts', post_list: posts});
    })
});

router.get("/new", function(req, res, next) {
    res.render("newpost", { title: "New post" });
});

router.post("/new", [
    body('title', 'Title is required').trim().isLength({ min: 1 }),
    body('content', 'Post content is required').trim().isLength({ min: 1 }),
    
    (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("newpost", { title: "New post", errors: errors.array(), ptitle: req.body.title, content: req.body.content });
            return;
        }

        var post = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user._id,
        }).save(function(err, post) {
            if(err){
                return next(err);
            }
            res.redirect("/posts");
        });
    }
]);

router.get("/:id", function(req, res, next) {
    Post.findById(req.params.id).populate("author").exec(function(err, post) {
        if(err){
            return next(err);
        }
        res.render("post", { title: post.title, post: post});
    })
});

module.exports = router;