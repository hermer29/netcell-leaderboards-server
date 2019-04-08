import express from 'express';
import { leaderboardsPublicRoute } from './public.mjs';
import { leaderboardsAdminRoute } from './admin.mjs';

export const leaderboardsRoute = express.Router();

leaderboardsRoute.use(leaderboardsPublicRoute);
leaderboardsRoute.use(leaderboardsAdminRoute);