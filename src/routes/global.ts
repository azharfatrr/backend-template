/**
 * Endpoint route for global request.
 */

import express from 'express';

import { login, logout, register } from '../handlers/auth';
import {
  getUserAll, getUserPagination,
} from '../handlers/user';

// Initialize the router.
const r = express.Router();

/**
 * Route for authentication login, register, and logout.
 */
// User register.
r.post('/auth/register', register);
// User login.
r.post('/auth/login', login);
// User logout.
r.post('/auth/logout', logout);

/**
 * Route for user requests.
 */
// Get all users.
r.get('/users', getUserAll);
// Get all users.
r.get('/users/pagination', getUserPagination);

// Export the router.
export default r;
