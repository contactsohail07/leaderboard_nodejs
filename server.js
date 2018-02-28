var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var frontpage = require('./routes/frontpage');
//var formpage = require('./routes/formpage');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/',frontpage );
app.use('/form',frontpage);
app.use('/signup',frontpage);
app.use('/signin',frontpage);
app.use('/link',frontpage);

http.createServer(app).listen(8080);

      
module.exports = app 