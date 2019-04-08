import express from 'express';
import Score from '../../Models/Score.mjs';
import User from '../../Models/User.mjs';
import { adminMiddleware } from '../Auth/authMiddleware.mjs';

export const leaderboardsAdminRoute = express.Router();

leaderboardsAdminRoute.use(adminMiddleware);

leaderboardsAdminRoute.route('/:leaderboardName/users')
	.get(async (req, res) => {
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

leaderboardsAdminRoute.route('/:leaderboardName/users/:username')
	.delete(async (req, res) => {
		const {
			leaderboardName,
			username,
		} = req.params;

		let user;
		try {
			user = await User.findOne({
				username,
			});
		} catch(error) {
			return res.status(400).send({ 
				error: 'User does not exist',
			});
		}

		try {
			await Score.deleteMany({
				leaderboard: leaderboardName,
				user: user._id,
			});
			res.status(200).send();
		} catch(error) {
			res.status(500).send({ error });
		}
	});

leaderboardsAdminRoute.route('/:leaderboardName/userActions/:username')
	.get(async (req, res) => {
		const {
			leaderboardName,
			username
		} = req.params;
		const {
			startTime,
			endTime,
		} = req.query;

		let user;
		try {
			user = await User.findOne({
				username,
			});
		} catch(error) {
			return res.status(400).send({ 
				error: 'User does not exist',
			});
		}
		
		try {
			const count = await Score.countUserAction(leaderboardName, user._id, startTime, endTime);
			res.status(200).send({
				count
			});
		} catch(error) {
			res.status(500).send({ error });
		}
	});