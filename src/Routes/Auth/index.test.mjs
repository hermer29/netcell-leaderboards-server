import 'dotenv/config';
import '../../db_test';

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app.mjs';
import { authRoute } from './index.mjs';

app.use('/auth', authRoute);

const USERNAME = 'test_unregistered';
const PASSWORD = 'test_unregistered';

test('Prevent unregistered user login', async () => {
	const response = await request(app)
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD,
		});
	expect(response.statusCode).toBe(403);
});

test('Register new user', async () => {
	const response = await request(app)
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		});
	expect(response.statusCode).toBe(200);
});

test('Prevent register same username', async () => {
	const response = await request(app)
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		});
	expect(response.statusCode).toBe(403);
});

test('Login new user', async () => {
	const response = await request(app)
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD,
		});
	expect(response.statusCode).toBe(200);
});

test('Prevent login wrong password', async () => {
	const response = await request(app)
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD + 'wrong',
		});
	expect(response.statusCode).toBe(403);
});

afterAll(async () => {
	await mongoose.connection.db.dropDatabase();
	await mongoose.connection.close();
});