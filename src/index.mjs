import 'dotenv/config';
import './db';

import { app } from './app';
import { authRoute } from './Routes/Auth/index.mjs';
import { leaderboardsRoute } from './Routes/Leaderboards/index.mjs';

app.use('/auth', authRoute);
app.use('/leaderboards', leaderboardsRoute);

app.listen(3000, () => {
	console.log('Listening to port', 3000);
});