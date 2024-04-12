import express from 'express';
import { prefsPublicRoute } from './public.mjs';

export const prefsRoute = express.Router();

prefsRoute.use(prefsPublicRoute);