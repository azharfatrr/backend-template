/**
 * Endpoint route for authorized user request.
 * The authorized user is an admin or coresponding user.
 */

import express from 'express';

import { isAuthorized } from '../configs/passport';
import {
  deleteUser, getUserById, patchDeviceId,
} from '../handlers/user';

// Initialize the router.
const r = express.Router();

/**
 * Route for user requests.
 */
// Get a user by id.
r.get('/users/:userId', isAuthorized, getUserById);
// Delete a user.
r.delete('/users/:userId', isAuthorized, deleteUser);
// Patch a user's device Id.
r.patch('/users/:userId/devices', isAuthorized, patchDeviceId);

// Export the router.
export default r;
