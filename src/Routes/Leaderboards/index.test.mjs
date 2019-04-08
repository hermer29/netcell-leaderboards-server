import 'dotenv/config';
import db_connected from  '../../db_test';

import _ from 'lodash';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app.mjs';
import { leaderboardsRoute } from './index.mjs';
import { authRoute } from '../Auth/index.mjs';
import { createAdminUser } from '../Auth/authMiddleware.mjs';
import * as websocket from '../../websocket.mjs';

jest.mock('../../websocket');

app.use('/auth', authRoute);
app.use('/leaderboards', leaderboardsRoute);

const USERNAME = 'test_username';
const PASSWORD = 'test_password';
const LEADERBOARD_NAME = 'test_leaderboard';

let agent;
let startTime;

beforeAll(async () => {
	await db_connected;
	await mongoose.connection.db.dropDatabase();
	await createAdminUser();

	startTime = Date.now();

	await request(app)
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		});
});

describe('Protected public API', () => {
	test('Protected get leaderboard list', async () => {
		await request(app)
			.get('/leaderboards')
			.expect(403);
	});
	
	test('Protected create score', async () => {
		await request(app)
			.post(`/leaderboards/${LEADERBOARD_NAME}`)
			.send({
				score: 1
			})
			.expect(403);
	});
});

describe('Protected admin API', () => {
	beforeAll(async () => {
		agent = request.agent(app);
		await agent
			.post('/auth/login')
			.send({
				username: USERNAME,
				password: PASSWORD,
			});
	});

	test('Protected listing users', async () => {
		await agent
			.get(`/leaderboards/${LEADERBOARD_NAME}/users`)
			.expect(403);
	});
	
	test('Protected delete user score', async () => {
		await agent
			.delete(`/leaderboards/${LEADERBOARD_NAME}/users/${USERNAME}`)
			.send()
			.expect(403);
	});

	test('Protected counting user actions', async () => {
		await agent
			.delete(`/leaderboards/${LEADERBOARD_NAME}/userActions/${USERNAME}`)
			.send()
			.expect(403);
	});
});

describe('Public API', () => {
	beforeAll(async () => {
		agent = request.agent(app);
		await agent
			.post('/auth/login')
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
		expect(websocket.broadcast).toHaveBeenCalledWith(
			expect.objectContaining({
				score: 1,
				username: USERNAME,
			})
		);
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
		agent = request.agent(app);
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
		
		const result = response.body;
		expect(result).toHaveProperty('count', 3);
	});	

	test('Delete user scores', async () => {
		await agent
			.delete(`/leaderboards/${LEADERBOARD_NAME}/users/${USERNAME}`)
			.send()
			.expect(200);
		
		const countResponse = await agent
			.get(`/leaderboards/${LEADERBOARD_NAME}/userActions/${USERNAME}`)
			.send();

		expect(countResponse.body).toHaveProperty('count', 0);

		const usersResponse = await agent
			.get(`/leaderboards/${LEADERBOARD_NAME}/users`)
			.send();
		
		const users = usersResponse.body;
		expect(users).toBeInstanceOf(Array);
		expect(users.length).toBe(0);
	});	
});

afterAll(async () => {
	await mongoose.connection.close();
});