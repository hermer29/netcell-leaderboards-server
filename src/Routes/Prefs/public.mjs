import express from 'express';
import Prefs from '../../Models/Prefs.mjs';
import { authMiddleware } from '../Auth/authMiddleware.mjs';
import { broadcast } from '../../websocket.mjs';

export const prefsPublicRoute = express.Router();

prefsPublicRoute.route('/')
	.get(async (req, res) => {
		const {
			user
		} = req;
		try {
			const prefs = await Prefs.getValues(user._id);
			if(prefs == null)
			{
				res.status(404).send("");
			}
			res.status(200).send(prefs);
		} catch(error) {
			res.status(500).send({ error });
		}
	})
	.post(authMiddleware, async (req, res) => {
		const {
			body: {
				values,
			},
			user,
		} = req;
		try {
			const result = await Prefs.create({
				values: values,
				user: user._id
			});
			broadcast({
				score,
				username: user.username,
				displayName: user.displayName,
				leaderboard: leaderboardName,
			});
			res.status(200).send(result);
		} catch(error) {
			console.error(error)
			res.status(500).send({ error });
		}
	});