# 🏆 Leaderboards Standalone Service

This is a standalone leaderboards service written with `Express` and `Mongoose`. This service is capable of doing the following things:

- Authenticate user with username & password (using `passportjs`) with customizable display name.
- Support multiple leaderboards where each player can score indenpendently on.
- Single administration account which can delete user scores and see how many times an user submitted score in a time window.
- All scores are saved, allowing query the leaderboard in any time window (which also shows how many users submitted score in that time window).
- Persistent Websocket is used to broadcast score actions to all connected client.

Libray & Frameworks: [Expresss](https://expressjs.com), [Mongoose](https://mongoosejs.com), [Jest](https://jestjs.io), [Passport](http://passportjs.org), [ws](https://github.com/websockets/ws). The demo UI is created on [CodeSandbox](https://codesandbox.io/) with [React.js](https://reactjs.org/).

# Setup

## Environment

Create a `.env` file with the content from `.sample.env` and fill the informations:

- `MONGO_URI`: the URI to connect to your mongoDB database which will be used for serving.
- `MONGO_URI_TEST`: the URI to connect to your mongoDB database which will be used for unit test.
- `SESSION_SECRET`: the secret string used for cookie session.
- `ADMIN_USERNAME`: credential for admin account.
- `ADMIN_PASSWORD`: credential for admin account.
- `ALLOW_ORIGIN`: the host domain of the client. 

## Install and Run

```
npm install
npm start
```

The application will be served at port `3000` for REST API & `4000` for Websocket server using `nodemon`.

## Try it out

By default the origin is pointed to the demo UI website at [https://38jw739r6q.codesandbox.io/](https://38jw739r6q.codesandbox.io/). You can see the code for the UI at [https://codesandbox.io/s/38jw739r6q](https://codesandbox.io/s/38jw739r6q). This website points to `localhost` server, so you will need to get your server up and running, and if neccessary, change the `HOST` value in `config.js` of the UI code.

![](https://i.imgur.com/6llPStz.png)

# Test

```
npm run test
```

The tests will be run by `jest` with `supertest`. You can also use `npm run test-watch` to continously run the test.

The test is connected to the mongoDb database specified by `MONGO_URI_TEST` environment variable. Before each test, this database will be dropped and all the data will be removed.

# API

## Authentication

### Register

**URL** : `/auth/register/`

**Method** : `POST`

**Auth required** : NO

**Data constraints**

```json
{
	"username": "[username in plain text]",
	"password": "[password in plain text]",
	"displayName": "[OPTIONAL - String - default to username]"
}
```

**Data example**

```json
{
	"username": "test_user",
	"password": "abcd1234",
	"displayName": "Test User",
}
```

**Response example**

```json
{
	"displayName": "Test User",
	"username": "test_user"
}
```

### Login


**URL** : `/auth/login/`

**Method** : `POST`

**Auth required** : NO

**Data constraints**

```json
{
    "username": "[username in plain text]",
    "password": "[password in plain text]"
}
```

**Data example**

```json
{
    "username": "test_user",
    "password": "abcd1234"
}
```

**Response example**

```json
{
	"displayName": "Test User",
	"username": "test_user"
}
```

### Get Profile


**URL** : `/auth/profile/`

**Method** : `GET`

**Auth required** : YES

**Response example**

```json
{
	"displayName": "Test User",
	"username": "test_user"
}
```

### Change Display Name


**URL** : `/auth/profile/`

**Method** : `PATCH`

**Auth required** : YES

**Data constraints**

```json
{
    "displayName": "[displayName in plain text]"
}
```

**Data example**

```json
{
    "displayName": "New Name"
}
```

## Leaderboard

### Get list of available leaderboards

**URL** : `/leaderboards/`

**Method** : `GET`

**Auth required** : YES

**Response example**

```json
[
	"leaderboard_1",
	"leaderboard_2"
]
```

### Get highScore leaderboard

**URL** : `/leaderboards/:leaderboardName`

**Method** : `GET`

**Auth required** : NO

**Data constraints**

```json
{
	"startTime": "[OPTIONAL - TimeStamp - specify time window]",
	"endTime": "[OPTIONAL - TimeStamp - specify time window]",
	"page": "[OPTIONAL - Number - the page to fetch, default to page 0]",
	"perPage": "[OPTIONAL - Number - amount of users per page, default to 10]"
}
```

**Response example**

```json
[
	{
		"username": "user1",
		"displayName": "User 1",
		"score": 10
	},
	{
		"username": "user2",
		"displayName": "User 2",
		"score": 8
	}
]
```

### Add score to leaderboard

**URL** : `/leaderboards/:leaderboardName`

**Method** : `POST`

**Auth required** : YES

**Data constraints**

```json
{
	"score": "[Number - the score to record]"
}
```

### Delete scores of an user from a leaderboard

**URL** : `/leaderboards/:leaderboardName/users/:username`

**Method** : `DELETE`

**Auth required** : ADMIN

### Count the number of times an user updated scores on a leaderboard

**URL** : `/leaderboards/:leaderboardName/userActions/:username`

**Method** : `GET`

**Auth required** : ADMIN

**Data constraints**

```json
{
	"startTime": "[OPTIONAL - TimeStamp - specify time window]",
	"endTime": "[OPTIONAL - TimeStamp - specify time window]"
}
```
