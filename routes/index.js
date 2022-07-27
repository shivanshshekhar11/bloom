var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
var User = require('../models/user');

const { body,validationResult } = require('express-validator');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Bloom' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: "Log In" });
});

/* POST login page. */
router.post('/login', passport.authenticate("local", {
  successRedirect: "/posts",
  failureRedirect: "/"
}));

/* GET signup page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign Up' });
});

/* POST signup page. */
router.post('/signup', [
  body('username', 'Username is required').trim().isLength({ min: 1 }),
  body('firstName', 'First name is required').trim().isLength({ min: 1 }).escape(),
  body('lastName').trim().escape(),
  body('password', 'Password is required').trim().isLength({ min: 1 }),
  body('cpassword', 'Confirmation password is required').trim().isLength({ min: 1 }),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('signup', { title: 'Sign Up', username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, errors: errors.array() });
        return;
      }

      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if(err){
          return next(err);
        }

        User.findOne({ username: req.body.username }, (err, user) => {
          if(err){
            return next(err);
          }
          if(user){
            res.render('signup', { title: 'Sign Up', username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, errors: [{ msg: 'Username already exists' }] });
            return;
          }

          const nuser = new User({
            username: req.body.username,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
          })

          nuser.save(err => {
            if (err) { 
                return next(err);
            }
            res.redirect("/");
          });
        })
        
      });
  }
]);

router.get('/logout', function (req, res){
  res.clearCookie('connect.sid');   //not req.logout();
  delete req.session
  res.redirect('/')
});

router.get("/membership", function(req, res, next){
  res.render("membership", { title: "Membership" });
})

router.post("/membership", function(req, res, next){
  if(req.body.password===process.env.passcode){
    User.findByIdAndUpdate(req.user._id, { status: "member" }, function(err, user){
      if(err){
        return next(err);
      }
      res.redirect("/posts");
    })
  }
  else{
    var err = "Incorrect passcode ... This club also has bouncers";
    res.render("membership", { title: "Membership", err: err });
  }
})

module.exports = router;
