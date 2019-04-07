import express from 'express';
import User from '../../Models/User.mjs';

export const authRoute = express.Router();

/** Wrap authenticate method to throw on error */
const authenticate = (userAuthenticate => async (username, password) => {
	const result = await userAuthenticate(username, password);
	if (result.error) {
		throw result.error;
	}
})(User.authenticate());

authRoute.post('/login', async (req, res) => {
	const {
		username,
		password
	} = req.body;
	try {
		await authenticate(username, password);
		res.status(200).send();
	} catch(error) {
		return res.status(403).send({
			error
		});
	}
});

authRoute.post('/register', async (req, res) => {
	const {
		username,
		password
	} = req.body;
	const user = new User({
		username,
		displayName: username,
	});
	try {
		await User.register(user, password);
		await authenticate(username, password);
		res.status(200).send();
	} catch(error) {
		return res.status(403).send({
			error
		});
	}
});