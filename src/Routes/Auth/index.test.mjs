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
	await request(app)
		.post('/auth/register')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(200);
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
	await request(app)
		.post('/auth/login')
		.send({
			username: USERNAME,
			password: PASSWORD,
		})
		.expect(200);
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

afterAll(async () => {
	await mongoose.connection.close();
});