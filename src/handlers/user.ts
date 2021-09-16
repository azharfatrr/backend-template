import { Request, Response } from 'express';
import log4js from 'log4js';
import Objection from 'objection';

import { isUniqueUsername, isValidEmail, isValidId } from '../helpers/validator';
import { apiVersion } from '../configs/server';
import { captureErrorLog } from '../helpers/log';
import User from '../models/User';
import { queryBuilder } from '../helpers/query_builder';
import { genPassword } from '../helpers/util';
import { ErrorContainer } from '../types/error';

const userLogger = log4js.getLogger('user');

/**
 * GET /api/v1/users
 * getUserAll is a function for handle request getting all user public data.
 */
export const getUserAll = async (req: Request, res: Response) => {
  try {
    // Query all user from database.
    const allUser = (await User.query()).map((user) => user.getPublicData());

    // Return response with user public data.
    return res.json({
      apiVersion,
      data: allUser,
    });
  } catch (err) {
    // Capture error message to log.
    captureErrorLog(userLogger, 'Could not get all user', err);

    // Return error response.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not get all user',
      },
    });
  }
};

/**
 * GET /api/v1/users/:userId
 * getUserById is a function for handle request get user public data by userId.
 * The user must be authorized.
 * @param req.params.userId - id of the user.
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Get user id from request.
    const { userId } = req.params;

    // Validate the input.
    const errors = new ErrorContainer();

    // Validate if userId is valid.
    if (!isValidId(userId)) {
      errors.addError('userId', 'params', 'User id is not valid');
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

    // Query all user from database.
    const user = await User.query().findById(userId);
    // Check if user is found.
    if (!user) {
      return res.status(404).json({
        apiVersion,
        error: {
          code: 404,
          message: 'User with specified id not exist',
        },
      });
    }

    // Return response with user public data.
    return res.json({
      apiVersion,
      data: user.getAuthorizedData(),
    });
  } catch (err) {
    captureErrorLog(userLogger, 'Could not get user data', err);

    // Return error response.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not get user data',
      },
    });
  }
};

/**
 * POST /api/v1/admin/users
 * createUser is a function for handle request creating new user.
 * The user only can be created by admin.
 * @param req.body - User models.
 */
export const createUser = async (req: Request, res: Response) => {
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
      username: req.body.username,
      picture: req.body.picture,
      email: req.body.email,
      deviceId: req.body.deviceId,
      role: req.body.role || 'user',
    } as User;

    // Hash the password.
    const saltHash = genPassword(req.body.password);
    newUser.hash = saltHash.hash;
    newUser.salt = saltHash.salt;

    // Create a new user in database.
    const user = await User.query().insert(newUser);

    // Response the user.
    return res.status(201).json({
      apiVersion,
      data: user.getAuthorizedData(),
    });
  } catch (err) {
    // Capture the server error.
    captureErrorLog(userLogger, 'Could not create the new user', err);

    // Return the error.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not create the new user',
      },
    });
  }
};

/**
 * PUT /api/v1/admin/users/:userId
 * updateUser is a function for handle request updating user data.
 * The user must be admin.
 * @param req.params.userId - id of the user.
 * @param req.body - User models.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Get user id from request.
    const { userId } = req.params;

    // Validate the input.
    const errors = new ErrorContainer();

    // Validate if userId is valid.
    if (!isValidId(userId)) {
      errors.addError('userId', 'params', 'User id is not valid');
    }

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
    if (!(await isUniqueUsername(req.body.username, userId))) {
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

    // Create a updated user object.
    const updatedUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      picture: req.body.picture,
      email: req.body.email,
      deviceId: req.body.deviceId,
      role: req.body.role || 'user',
    } as User;

    // Hash the password.
    const saltHash = genPassword(req.body.password);
    updatedUser.hash = saltHash.hash;
    updatedUser.salt = saltHash.salt;

    // Update and fetch user data.
    const user = await User.query().updateAndFetchById(userId, updatedUser);
    // User is not found
    if (!user) {
      return res.status(404).json({
        apiVersion,
        error: {
          code: 404,
          message: 'User with specified id not exist',
        },
      });
    }

    // Return response with user data.
    return res.status(200).json({
      apiVersion,
      data: user.getAuthorizedData(),
    });
  } catch (err) {
    captureErrorLog(userLogger, 'Could not update user data', err);

    // Return error response.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not update user data',
      },
    });
  }
};

/**
 * DELETE /api/v1/users/:userId
 * deleteUser is a function for handle request deleting user data.
 * The user must be authorized.
 * @param req.params.userId - id of the user.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Get the user id.
    const { userId } = req.params;

    // Validate if userId is valid.
    if (!isValidId(userId)) {
      return res.status(400).json({
        apiVersion,
        error: {
          code: 400,
          message: 'Failed during input validation',
        },
      });
    }

    // Update and fetch user data.
    await User.query().deleteById(userId);

    // Return response with user data.
    return res.json({
      apiVersion,
      deleted: true,
    });
  } catch (err) {
    captureErrorLog(userLogger, 'Could not delete user data', err);

    // Return error response.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not delete user data',
      },
    });
  }
};

/**
 * PATCH /api/v1/users/:userId/devices
 * patchDeviceId is a function for patching the IoT device id of the user.
 * The user must be authorized.
 * @param req.params.userId - id of the user.
 * @param req.body.deviceId - IoT device id.
 * @param res - response object.
 */
export const patchDeviceId = async (req: Request, res: Response) => {
  try {
    // Get the user id.
    const { userId } = req.params;

    // Validate the input.
    const errors = new ErrorContainer();

    // Validate if userId is valid.
    if (!isValidId(userId)) {
      errors.addError('userId', 'params', 'User id is not valid');
    }

    // Validate all request body needed is exist.
    if (!req.body || !req.body.deviceId) {
      errors.addError('deviceId',
        'Missing required fields.');
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

    // Create a updated user object.
    const deviceId = {
      deviceId: req.body.deviceId,
    };

    // Update and fetch user data.
    const user = await User.query().updateAndFetchById(userId, deviceId);
    // User is not found
    if (!user) {
      return res.status(404).json({
        apiVersion,
        error: {
          code: 404,
          message: 'User with specified id not exist',
        },
      });
    }

    // Return response with user data.
    return res.status(200).json({
      apiVersion,
      data: user.getAuthorizedData(),
    });
  } catch (err) {
    captureErrorLog(userLogger, 'Could not patch user device Id', err);

    // Return error response.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not patch user device Id',
      },
    });
  }
};

/**
 * GET /api/v1/users/pagination
 * getUsersPagination is a function for handle request getting users with pagination.
 * @param req.query - pagination query.
 * @param req.query.page - page number.
 * @param req.query.limit - limit of items per page.
 * @param req.query.sort - sort query by some column.
 * @param req.query.query - the query of item by specific value. Check the documentation.
 */
export const getUserPagination = async (req: Request, res: Response) => {
  try {
    // Get query params.
    const {
      query, sort, page, limit,
    } = req.query;

    // Create query builder
    let qBuilder = User.query();
    // Add query params to query builder.
    if (query) {
      // The query must be in encoded base64 and encoded to safe URI.
      // Column name must be in snake case format.
      try {
        qBuilder = queryBuilder(query.toString(), qBuilder);
      } catch (err) {
        captureErrorLog(userLogger, 'Add query params to query builder error', err);
      }
    }

    // Add sort params to query builder.
    if (sort) {
      let columnName = `${sort}`;
      // If sort direction is not specified, set it to asc.
      let order: Objection.OrderByDirection = 'asc';
      // If sort direction is specified, check if it desc.
      if (columnName[0] === '-') {
        columnName = columnName.substring(1);
        order = 'desc';
      }

      try {
        qBuilder = qBuilder.orderBy(columnName, order);
      } catch (err) {
        captureErrorLog(userLogger, 'Add sort params to query builder error', err);
      }
    }

    // Parse pageIndex.
    const pageIdx = Number.isNaN(parseInt(`${page}`, 10))
      ? 1
      : parseInt(`${page}`, 10);

    // Parse itemsPerPage.
    const pageItem = Number.isNaN(parseInt(`${limit}`, 10))
      ? 10
      : parseInt(`${limit}`, 10);

    // result is a variable that contain the result pagination
    const result = await qBuilder.page(pageIdx - 1, pageItem);

    // Output item only public data.
    const resItem = result.results.map((user) => user.getPublicData());

    // Return response with user data.
    return res.json({
      apiVersion,
      data: {
        query: query ? `${query}` : '',
        sort: sort ? `${sort}` : 'id',
        page: pageIdx,
        limit: pageItem,
        pageItems: result.results.length,
        totalItems: result.total,
        totalPages: Math.floor(result.total / pageItem),
        items: resItem,
      },
    });
  } catch (err) {
    captureErrorLog(userLogger, 'Could not get pagination user data', err);

    // Return error response.
    return res.status(500).json({
      apiVersion,
      error: {
        code: 500,
        message: 'Could not get pagination user data',
      },
    });
  }
};
