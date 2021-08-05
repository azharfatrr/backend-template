import express from 'express';
import { isAuthenticated } from '../configs/passport';

import { login, logout, register } from '../handlers/auth';
import {
  getUserAll, getUserByID, createUser, updateUser, deleteUser, getUserPagination,
} from '../handlers/user';

/**
 * Endpoint route for global request.
 */

// Initialize the router.
const r = express.Router();

/**
 * Route for authentication login, register, and logout.
 */
// User register.
r.post('/auth/register', register)
// User login.
r.post('/auth/login', login)
// User logout.
r.post('/auth/logout', logout)

/**
 * Route for user requests.
 */
// Get all users.
r.get('/users', getUserAll);
// Get all users.
r.get('/users/pagination', getUserPagination);
// Get a user by id.
r.get('/users/:userId', getUserByID);
// Create a user.
r.post('/users', createUser);
// Update a user.
r.put('/users/:userId', updateUser);
// Delete a user.
r.delete('/users/:userId', deleteUser);
// TODO: Get user pagination.

// TODO: TESTING, DELETE THIS
r.get('/auth/test', isAuthenticated, (req, res) => {
  console.log(req);
  res.send('test');
})

export default r;
