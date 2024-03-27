import 'dotenv/config.js';
import connected from './db.mjs';

import { app } from './app.mjs';
import { authRoute } from './Routes/Auth/index.mjs';
import { leaderboardsRoute } from './Routes/Leaderboards/index.mjs';
import { createAdminUser } from './Routes/Auth/authMiddleware.mjs';

app.use('/auth', authRoute);
app.use('/leaderboards', leaderboardsRoute);

connected
	.then(() => createAdminUser())
	.then(() => {
		app.listen(3000, () => {
			console.log('Listening to port', 3000);
		});
	});
