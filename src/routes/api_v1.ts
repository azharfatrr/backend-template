/**
 * Middleware route for request.
 */

import { Router } from 'express';

import globalRoutes from './global';

// Initialize the router.
const app = Router();

// Add the global routes.
app.use('/', globalRoutes);

export default app;
