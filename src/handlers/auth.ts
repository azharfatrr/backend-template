import { Request, Response } from 'express';
import log4js from 'log4js';

import { apiVersion, cookieExpirationTime, jwtCookieName } from '../configs/server';
import User from '../models/User';
import { genPassword, issueJWT, validPassword } from '../helpers/util';
import { captureErrorLog } from '../helpers/log';
import { ErrorContainer } from '../types/error';
import { isUniqueUsername, isValidEmail } from '../helpers/validator';

const authLogger = log4js.getLogger('auth');

/**
 * POST /api/v1/auth/register
 * register is a function for register a new user.
 * @param req.body.firstName - User's first name.
 * @param req.body.lastName - User's last name.
 * @param req.body.email - User's email.
 * @param req.body.username - The username of the user.
 * @param req.body.password - The password of the user.
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate the input.
    const errors = new ErrorContainer();

    // Validate all request body needed is exist.
    if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.email
      || !req.body.username || !req.body.password) {
      errors.addError('firstName, lastName, email, username or password', 'body',
        'Missing required fields.');
    }

    // Validate the email is valid.
    if (!isValidEmail(req.body.email)) {
      errors.addError('email', 'body', 'The email format is not valid.');
    }

    // Validate if the username is valid and unique.
    if (!(await isUniqueUsername(req.body.username))) {
      errors.addError('username', 'body', 'The username is already taken.');
    }

    // If there exist an error during validation, return the error.
    if (errors.hasErrors()) {
      // Send the error message.
      return res.status(400).json({
        apiVersion,
        error: {
          code: 400,
          message: 'Failed during input validation',
          errors: errors.getErrors(),
        },
      });
    }

    // Create a new user object.
    const newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      role: 'user',
    } as User;

    // Hash the password.
    const saltHash = genPassword(req.body.password);
    newUser.hash = saltHash.hash;
    newUser.salt = saltHash.salt;

    // Create a new user in database.
    const user = await User.query().insert(newUser);

    // Create token and set to cookies.
    const token = issueJWT(newUser);

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
        ...user.getAuthorizedData(),
      },
    });
  } catch (err) {
    // Capture the server error.
    captureErrorLog(authLogger, 'Could not register the user', err);

    // Return the error.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not register the user',
      },
    });
  }
};

/**
 * POST /api/v1/auth/login
 * Login is a function for user login to the system.
 * @param req.body.username - The username of the user.
 * @param req.body.password - The password of the user.
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate the input.
    const errors = new ErrorContainer();

    // Validate all request body needed is exist.
    if (!req.body || !req.body.username || !req.body.password) {
      errors.addError('username or password', 'body', 'Missing required fields.');
    }

    // If there exist an error during validation, return the error.
    if (errors.hasErrors()) {
      // Send the error message.
      return res.status(400).json({
        apiVersion,
        error: {
          code: 400,
          message: 'Failed during input validation',
          errors: errors.getErrors(),
        },
      });
    }

    // Find the user by username.
    const user = await User.query().where('username', req.body.username).first();

    // Check if the user exists.
    if (!user) {
      errors.addError('username', 'body', 'The username is not found.');
    }

    // Check if the password is correct.
    if (!validPassword(req.body.password, user.hash, user.salt)) {
      errors.addError('password', 'body', 'The password is not correct.');
    }

    // If there exist an error during username and password validation, return the error.
    if (errors.hasErrors()) {
      return res.status(401).json({
        apiVersion,
        error: {
          code: 401,
          message: 'Username or password is wrong',
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

    // Response the user.
    return res.json({
      apiVersion,
      data: {
        login: true,
        ...user.getAuthorizedData(),
      },
    });
  } catch (err) {
    captureErrorLog(authLogger, 'Could not login the user', err);

    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not login the user',
      },
    });
  }
};

/**
 * POST /api/v1/auth/logout
 * Logout function will remove all cookie from client and return logout status.
 */
export const logout = (req: Request, res: Response) => {
  try {
    // Remove the cookie.
    req.logout();
    res.clearCookie(jwtCookieName);

    // Response the logout status.
    return res.json({
      apiVersion,
      data: {
        logout: true,
      },
    });
  } catch (err) {
    captureErrorLog(authLogger, 'Could not logout the user', err);

    return res.status(500).json({
      apiVersion,
      error: {
        message: 'Could not logout the user',
      },
    });
  }
};
