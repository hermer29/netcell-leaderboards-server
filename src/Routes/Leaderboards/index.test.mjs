import 'dotenv/config';
import db_connected from  '../../db_test';

import _ from 'lodash';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app.mjs';
import { leaderboardsRoute } from './index.mjs';
import { authRoute } from '../Auth/index.mjs';
import { createAdminUser } from '../Auth/authMiddleware.mjs';

app.use('/auth', authRoute);
app.use('/leaderboards', leaderboardsRoute);

const USERNAME = 'test_username';
const PASSWORD = 'test_password';
const LEADERBOARD_NAME = 'test_leaderboard';

let agent = request.agent(app);
let startTime;

beforeAll(async () => {
	await db_connected;
	await mongoose.connection.db.dropDatabase();
	await createAdminUser();

	startTime = Date.now();
});

describe('Public API', () => {
	beforeAll(async () => {
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
});

describe('Admin', () => {
	beforeAll(async () => {
		await agent
			.post('/auth/login')
			.send({
				username: process.env.ADMIN_USERNAME,
				password: process.env.ADMIN_PASSWORD,
			});
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
	
	test('Count user actions', async () => {
		const response = await agent
			.get(`/leaderboards/${LEADERBOARD_NAME}/userActions/${USERNAME}?startTime=${startTime}&endTime=${Date.now()}`)
			.send()
			.expect(200);
		
		const users = response.body;
		expect(users).toHaveProperty('count', 3);
	});	
});

afterAll(async () => {
	await mongoose.connection.close();
});