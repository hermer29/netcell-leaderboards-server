import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'cookie-session';
import User from './Models/User';

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

export const app = express();

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
	resave: true
}));
app.use(passport.initialize());
app.use(passport.session());