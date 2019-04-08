import express from 'express';
import User from '../../Models/User.mjs';
import { authMiddleware } from './authMiddleware.mjs';

export const authRoute = express.Router();

/** Wrap authenticate method to throw on error */
const authenticate = (userAuthenticate => async (req, username, password) => {
	const {
		user,
		error,
	} = await userAuthenticate(username, password);
	
	if (error) {
		throw error;
	} else {
		await new Promise((resolve, reject) => {
			req.login(user, error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
		return {
			username: user.username,
			displayName: user.displayName,
		};
	}
})(User.authenticate());

authRoute.post('/login', async (req, res) => {
	const {
		username,
		password
	} = req.body;
	try {
		const result = await authenticate(req, username, password);
		res.status(200).send(result);
	} catch(error) {
		return res.status(403).send({
			error
		});
	}
});

authRoute.post('/register', async (req, res) => {
	const {
		username,
		password,
		displayName
	} = req.body;
	const user = new User({
		username,
		displayName: displayName || username,
	});
	try {
		await User.register(user, password);
		const result = await authenticate(req, username, password);
		res.status(200).send(result);
	} catch(error) {
		return res.status(403).send({
			error
		});
	}
});

authRoute.route('/profile')
	.get(authMiddleware, async (req, res) => {
		try {
			const user = await User.findById(req.user.id);
			res.status(200).send({
				username: user.username,
				displayName: user.displayName,
			});
		} catch(error) {
			return res.status(500).send({
				error
			});
		}
	})
	.patch(authMiddleware, async (req, res) => {
		const {
			displayName
		} = req.body;

		try {
			const user = await User.findById(req.user.id);
			user.displayName = displayName;
			await user.save();
			res.status(200).send();
		} catch(error) {
			return res.status(500).send({
				error
			});
		}
	});