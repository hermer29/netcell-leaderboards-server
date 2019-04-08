import express from 'express';
import Score from '../../Models/Score.mjs';
import { authMiddleware } from '../Auth/authMiddleware.mjs';
import { broadcast } from '../../websocket';

export const leaderboardsPublicRoute = express.Router();

leaderboardsPublicRoute.route('/')
	.get(authMiddleware, async (req, res) => {
		try {
			const leaderboards = await Score.distinct('leaderboard');
			res.status(200).send(leaderboards);
		} catch(error) {
			res.status(500).send({ error });
		}
	});

leaderboardsPublicRoute.route('/:leaderboardName')
	.get(async (req, res) => {
		const {
			leaderboardName
		} = req.params;
		try {
			const leaderboard = await Score.getLeaderboard(leaderboardName);
			res.status(200).send(leaderboard);
		} catch(error) {
			res.status(500).send({ error });
		}
	})
	.post(authMiddleware, async (req, res) => {
		const {
			params: {
				leaderboardName,
			},
			body: {
				score,
			},
			user,
		} = req;
		try {
			const result = await Score.create({
				score,
				user: user._id,
				leaderboard: leaderboardName,
			});
			broadcast({
				score,
				username: user.username,
				displayName: user.displayName,
				leaderboard: leaderboardName,
			});
			res.status(200).send(result);
		} catch(error) {
			res.status(500).send({ error });
		}
	});