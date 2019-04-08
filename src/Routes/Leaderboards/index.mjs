import express from 'express';
import Score from '../../Models/Score.mjs';
import { authMiddleware } from '../Auth/authMiddleware.mjs';
import { adminMiddleware } from '../Auth/authMiddleware.mjs';

export const leaderboardsRoute = express.Router();

leaderboardsRoute.route('/')
	.get(authMiddleware, async (req, res) => {
		try {
			const leaderboards = await Score.distinct('leaderboard');
			res.status(200).send(leaderboards);
		} catch(error) {
			res.status(500).send({ error });
		}
	});

leaderboardsRoute.route('/:leaderboardName')
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
			res.status(200).send(result);
		} catch(error) {
			res.status(500).send({ error });
		}
	});

leaderboardsRoute.route('/:leaderboardName/users')
	.get(adminMiddleware, async (req, res) => {
		const {
			leaderboardName,
		} = req.params;
		const {
			startTime,
			endTime,
		} = req.query;
		try {
			const users = await Score.getUsers(leaderboardName, startTime, endTime);
			res.status(200).send(users);
		} catch(error) {
			res.status(500).send({ error });
		}
	});
	// .post(authMiddleware, async (req, res) => {
	// 	const {
	// 		params: {
	// 			leaderboardName,
	// 		},
	// 		body: {
	// 			score,
	// 		},
	// 		user,
	// 	} = req;
	// 	try {
	// 		const result = await Score.create({
	// 			score,
	// 			user: user._id,
	// 			leaderboard: leaderboardName,
	// 		});
	// 		res.status(200).send(result);
	// 	} catch(error) {
	// 		res.status(500).send({ error });
	// 	}
	// });
