/**
 * Endpoint route for admin authorized request.
 */

import express from 'express';

import { isAdmin } from '../configs/passport';
import { createUser, updateUser } from '../handlers/user';

// Initialize the router.
const r = express.Router();

/**
 * Middleware for Admin.
 */
r.use(isAdmin);

/**
 * Route for user requests.
 */
// Create a user.
r.post('/users', createUser);
// Update a user.
r.put('/users/:userId', updateUser);

// Export the router.
export default r;
