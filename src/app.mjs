import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import User from './Models/User';

export const app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
	resave: true
}));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());