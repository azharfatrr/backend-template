/**
 * Middleware route for request.
 */

import { Router } from 'express';

import globalRoutes from './global';
import authorizeRoutes from './authorized';
import adminRoutes from './admin';

// Initialize the router.
const app = Router();

// Add the global routes.
app.use('/', globalRoutes);

// Add the global routes but authorized.
app.use('/', authorizeRoutes);

// Add the admin routes.
app.use('/admin', adminRoutes);

// Export the router.
export default app;
