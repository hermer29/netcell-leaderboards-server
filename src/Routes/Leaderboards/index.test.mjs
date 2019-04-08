import 'dotenv/config';
import db_connected from  '../../db_test';

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app.mjs';
import { leaderboardsRoute } from './index.mjs';
import { authRoute } from '../Auth/index.mjs';

app.use('/auth', authRoute);
app.use('/leaderboards', leaderboardsRoute);

const USERNAME = 'test_username';
const PASSWORD = 'test_password';
const LEADERBOARD_NAME = 'test_leaderboard';

const agent = request.agent(app);

beforeAll(async () => {
	await db_connected;
	await mongoose.connection.db.dropDatabase();

	await agent
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		});
});

test('Get leaderboard list', async () => {
	const response = await agent
		.get('/leaderboards')
		.expect(200);
	expect(response.body).toBeInstanceOf(Array);
});

test('Create score', async () => {
	await agent
		.post(`/leaderboards/${LEADERBOARD_NAME}`)
		.send({
			score: 1
		})
		.expect(200);
});

test('Get leaderboard', async () => {
	const response = await agent
		.get(`/leaderboards/${LEADERBOARD_NAME}`)
		.expect(200);
	expect(response.body).toBeInstanceOf(Array);
	expect(response.body.length).toBe(1);
	expect(response.body[0].score).toBe(1);
});

test('Update score', async () => {
	await agent
		.post(`/leaderboards/${LEADERBOARD_NAME}`)
		.send({
			score: 1
		})
		.expect(200);
});

afterAll(async () => {
	await mongoose.connection.db.dropDatabase();
	await mongoose.connection.close();
});