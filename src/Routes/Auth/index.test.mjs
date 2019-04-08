import 'dotenv/config';
import db_connected from  '../../db_test';

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app.mjs';
import { authRoute } from './index.mjs';

app.use('/auth', authRoute);

const USERNAME = 'test_unregistered';
const PASSWORD = 'test_unregistered';

beforeAll(async () => {
	await db_connected;
	await mongoose.connection.db.dropDatabase();
});

test('Prevent unregistered user login', async () => {
	await request(app)
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(403);
});

test('Register new user', async () => {
	const agent = request.agent(app);
	await agent
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(200);

	const response = await agent
		.get('/auth/profile')
		.expect(200);
	const profile = response.body;
	expect(profile).toHaveProperty('username', USERNAME);
	expect(profile).toHaveProperty('displayName', USERNAME);
});

test('Prevent register same username', async () => {
	await request(app)
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(403);
});

test('Login new user', async () => {
	const agent = request.agent(app);
	await agent
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(200);

	const response = await agent
		.get('/auth/profile')
		.expect(200);
	const profile = response.body;
	expect(profile).toHaveProperty('username', USERNAME);
	expect(profile).toHaveProperty('displayName', USERNAME);
});

test('Prevent login wrong password', async () => {
	await request(app)
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD + 'wrong',
		})
		.expect(403);
});

test('Change display name', async () => {
	const agent = request.agent(app);
	await agent
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(200);

	await agent
		.patch('/auth/profile')
		.send({
			displayName: USERNAME + 'changed'
		})
		.expect(200);

	const response = await agent
		.get('/auth/profile')
		.expect(200);
	const profile = response.body;
	expect(profile).toHaveProperty('username', USERNAME);
	expect(profile).toHaveProperty('displayName', USERNAME + 'changed');
});

afterAll(async () => {
	await mongoose.connection.close();
});