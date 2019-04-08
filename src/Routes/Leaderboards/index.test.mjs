import 'dotenv/config';
import db_connected from  '../../db_test';

import _ from 'lodash';
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
let startTime;

beforeAll(async () => {
	await db_connected;
	await mongoose.connection.db.dropDatabase();

	startTime = Date.now();

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

	const leaderboard = response.body;
	expect(leaderboard).toBeInstanceOf(Array);
	expect(leaderboard.length).toBe(1);

	const userScore = _.find(leaderboard, { username: USERNAME });
	expect(userScore).toBeDefined();
	expect(userScore.score).toBe(1);
});

test('Update higher score', async () => {
	await agent
		.post(`/leaderboards/${LEADERBOARD_NAME}`)
		.send({
			score: 2
		})
		.expect(200);
		
	const response = await agent
		.get(`/leaderboards/${LEADERBOARD_NAME}`)
		.expect(200);

	const leaderboard = response.body;
	expect(leaderboard).toBeInstanceOf(Array);
	expect(leaderboard.length).toBe(1);

	const userScore = _.find(leaderboard, { username: USERNAME });
	expect(userScore).toBeDefined();
	expect(userScore.score).toBe(2);
});

test('Update lower score', async () => {
	await agent
		.post(`/leaderboards/${LEADERBOARD_NAME}`)
		.send({
			score: 1
		})
		.expect(200);
		
	const response = await agent
		.get(`/leaderboards/${LEADERBOARD_NAME}`)
		.expect(200);

	const leaderboard = response.body;
	expect(leaderboard).toBeInstanceOf(Array);
	expect(leaderboard.length).toBe(1);

	const userScore = _.find(leaderboard, { username: USERNAME });
	expect(userScore).toBeDefined();
	expect(userScore.score).toBe(2);
});

test('Get users', async () => {
	const response = await agent
		.get(`/leaderboards/${LEADERBOARD_NAME}/users?startTime=${startTime}&endTime=${Date.now()}`)
		.send()
		.expect(200);
	
	const users = response.body;
	expect(users).toBeInstanceOf(Array);
	expect(users.length).toBe(1);

	const user = users[0];
	expect(user).toHaveProperty('username', USERNAME);
});

afterAll(async () => {
	await mongoose.connection.close();
});