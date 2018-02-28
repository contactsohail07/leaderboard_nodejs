var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
var mongoose = require('mongoose');
var dbConfig = require('./db.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var objectId =require('mongodb').ObjectId;

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.render('failurepage');
}

mongoose.connect(dbConfig.url);
console.log("hello1");
var Schema = mongoose.Schema;

passport.serializeUser(function(user, done) {
  done(null, user._id);
console.log("hello2");
});

passport.deserializeUser(function(id, done) {
  userData.findById(id, function(err, user) {
    done(err, user);
  });
  console.log("hello3");
});


MongoClient.connect(url);
console.log("hello4");

var leaderDataSchema = new Schema({
	name : String,
	score : Number
});

var leaderData = mongoose.model('leaderData',leaderDataSchema);


router.get('/',function(req,res){
		console.log("hello5");
		leaderData.find()
			.then(function(doc){
				console.log(doc);
				res.render('frontpage',{ items : doc})	
			});
 });

router.get('/form',isAuthenticated,function (req,res,next){
	console.log("hello7");
	res.render('formpage');
});

router.post('/forminsert',function (req,res,next){
	console.log("insert");
	var item = {
		creator : req.user,
		name : req.body.name,
		score : req.body.score
	};

	var data = new leaderData(item);
	data.save();
	console.log(item);
	console.log("hello8");
	res.redirect('/');

});

router.get('/link/:id', function(req,res,next){
		console.log("hellolink"); 
    var idd = req.params.id
		leaderData.find({"_id":objectId(idd)})
			.then(function(doc){
				console.log(doc);
				res.render('linkpage',{ items : doc })	
			});
		});

router.get('/delete/:id',isAuthenticated, function(req,res,next){
    console.log("hellodelete"); 
    var idd = req.params.id
    console.log(idd)
    leaderData.findByIdAndRemove(req.params.id,function(doc){
        console.log(doc);
        res.redirect('/')  
      });
    });

router.get('/edit/:id',isAuthenticated,function (req,res,next){
  var idd = req.params.id;
 leaderData.find({"_id":objectId(idd)})
      .then(function(doc){
        console.log('editpage')
        console.log(doc);
        res.render('editpage',{ items : doc })  
      });
});

router.post('/update/:id', function(req,res,next){
    console.log("helloedit"); 
  console.log('post details -------------------->>>')
  console.log(req.params)
     var idd = req.params.id
     console.log('iddddd')
     console.log(idd)
        leaderData.update({_id:idd},{$set: {name:req.body.name,score:req.body.score}},function(err,done){
          console.log('paniyaram')
          console.log(done)

        })
        res.redirect('/'); 
      });
    

var userDataSchema = new Schema({
	username: String,
    password: String,
});

var userData = mongoose.model('userData',userDataSchema);


router.get('/signup',function (req,res,next){
	console.log("hello9");
	res.render('form_signup');
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash : true 
  }));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
  	console.log("strategyhello")
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      userData.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new userData();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

var createHash = function(password){
 return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

router.get('/signin', function (req,res,next ){
	console.log("hello10");
	res.render('form_signin');
});

router.post('/signin', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash : true 
  }));


// passport/login.js
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    userData.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
}));

var isValidPassword = function(user, password){
  return bcrypt.compareSync(password, user.password);
}

router.get('/signout',isAuthenticated,function(req,res,next){
	console.log("hello11");
	req.logout();
	res.redirect('/');
});







module.exports = router,url;