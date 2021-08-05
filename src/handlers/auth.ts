import { Request, Response } from 'express';

import { apiVersion, cookieExpirationTime, jwtCookieName } from '../configs/server';
import User, { isUser } from '../models/User';
import { issueJWT } from '../helpers/util';

/**
 * POST /api/v1/auth/register
 * register is a function for register a new user.
 * @param req.body - User models.
 */
export const register = async (req: Request, res: Response) => {
  // Get the request body.
  const reqBody = req.body;

  // Validate if reqBody is user model.
  if (!isUser(reqBody)) {
    return res.status(400).json({
      apiVersion,
      error: {
        message: 'Failed during input validation',
      },
    });
  }

  // Create a new user.
  const user = await User.query().insert(reqBody);

  // Create token and set to cookies.
  const token = issueJWT(user);

  // Create a cookies.
  res.cookie(jwtCookieName, token, {
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    maxAge: Number(cookieExpirationTime),
  });

  // Response the user.
  return res.json({
    apiVersion,
    data: {
      register: true,
    },
  });
};

/**
 * POST /api/v1/auth/login
 * Login is a function for user login to the system.
 * @param req.body.username - username of the user.
 * @param req.body.password - password of the user.
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Find the user by username.
  const user = await User.query().where('username', username).first();

  // Check if the user exists.
  if (!user) {
    return res.status(401).json({
      apiVersion,
      error: {
        message: 'Failed during login',
      },
    });
  }

  // Check if the password is correct.
  if (!user.password === password) {
    return res.status(401).json({
      apiVersion,
      error: {
        message: 'Failed during login',
      },
    });
  }

  // Create token and set to cookies.
  const token = issueJWT(user);

  // Create a cookies.
  res.cookie(jwtCookieName, token, {
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    maxAge: Number(cookieExpirationTime),
  });

  return res.json({
    apiVersion,
    data: {
      login: true,
    },
  });
};

/**
 * POST /api/v1/auth/logout
 * Logout function will remove all cookie from client and return logout status.
 */
export const logout = (req: Request, res: Response) => {
  req.logout();

  res.clearCookie(jwtCookieName);

  res.json({
    apiVersion,
    data: {
      logout: true,
    },
  });
};
