import express from 'express';
import Prefs from '../../Models/Prefs.mjs';
import { authMiddleware } from '../Auth/authMiddleware.mjs';

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
			var currentUserPrefsModel = {
				values
			}
			Prefs.updateOne(
				{
					user: user._id
				}, 
				{
					user: user._id, 
					values
				}, 
				{
					upsert: true
				});

			res.status(200).send(currentUserPrefsModel);
		} catch(error) {
			console.error(error)
			res.status(500).send({ error });
		}
	});