/**
 * The default Passport configuration.
 * Using Passport JWT Strategy.
*/
import fs from 'fs';
import path from 'path';
import passport from 'passport';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { Request, Response, NextFunction } from 'express';

import { jwtPayload } from '../types/jwt';
import User from '../models/User';
import { apiVersion } from './server';

/**
 * The Private Key for JWT.
 */
const pathToPrivKey = path.join(__dirname, '../../keys/', 'id_rsa_priv.pem');
export const jwtPrivateKey = fs.readFileSync(pathToPrivKey, 'utf8');

/**
 * The Public Key for JWT.
 */
const pathToPubKey = path.join(__dirname, '../../keys/', 'id_rsa_pub.pem');
export const jwtPublicKey = fs.readFileSync(pathToPubKey, 'utf8');

/**
 * The options for Passport JWT Strategy.
 * At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
 */
const optionsJWT = {
  secretOrKey: jwtPublicKey,
  algorithms: ['RS256'],
  jwtFromRequest: (req: Request): any => {
    // Read the token from the Authorization header.
    let token = (req.headers.authorization || '').split(' ')[1];
    // If token not exist, read token from cookies.
    if (!token) token = req.cookies.jwt;
    return token;
  },
};

/**
 * JWT Auth strategy.
 * Strategy for handle jwt token. This strategy will check token expired or not, token information
 * is valid or not.
 * @param optionsJWT - the option for JWT strategy.
 * @param payload - the JWT payload that passed from passport.
 */
passport.use(
  new JWTStrategy(optionsJWT, async (payload: jwtPayload, done) => {
    // The payload from JWT token.
    const { data, exp } = payload;

    // Check token expired or not.
    if (Date.now() >= exp) return done(null, false);

    // Check if id exist or not.
    try {
      // Query the user from database.
      const user = await User.query().where('id', data.user_id).first();
      if (!user) throw new Error('User with specified id not found');
      // Return the user.
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }),
);

/**
 * isAuthenticated function is middleware for checking if user authenticate or not, this middleware
 * will use passport authenticate function to get user data, if not error user data will add to
 * http request as req.user, if error this function will send error with status 401 unauthorized.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user) => {
    // Check if there is error or user not found.
    if (err || !user) {
      return res.status(401).json({
        apiVersion,
        error: {
          code: 401,
          message: 'User not authorize',
        },
      });
    }

    // Assign req.user
    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * isAuthorized function is middleware for checking if user is authorized or not, this middleware
 * will use passport authenticate function to get user data, if not error user data will add to
 * http request as req.user, if error this function will send error with status 401 unauthorized.
 * This function will check if the userId in params is equal to user id in token.
 * Admin is always authorized to access all endpoints.
 * @param req.params.userId - the userId that going to match with user id in token.
 * @param user.role : user role ('user' or 'admin').
 */
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user) => {
    // Check if there is error or user not found.
    if (err || !user) {
      return res.status(401).json({
        apiVersion,
        error: {
          code: 401,
          message: 'User not authorize',
        },
      });
    }

    // Check if userId in params is equal to user id in token or if user is admin.
    if (String(req.params.userId) !== String(user.id) && !user.isAdmin()) {
      return res.status(403).json({
        apiVersion,
        error: {
          code: 403,
          message: 'User forbidden',
        },
      });
    }

    // Assign req.user
    req.user = user;
    return next();
  })(req, res, next);
};

/**
* isAdmin function is middleware for checking if user have role admin or not, if not this
* function will return 403 status error forbidden.
* @param user.role : user role ('user' or 'admin').
*/
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user) => {
    // Check if there is error or user not found and the user is not admin.
    if (err || !user || !user.isAdmin()) {
      return res.status(403).json({
        apiVersion,
        error: {
          code: 403,
          message: 'User forbidden',
        },
      });
    }

    // Assign req.user
    req.user = user;
    return next();
  })(req, res, next);
};

// /**
//  * isAdmin function is middleware for checking if user have role admin or not, if not this
//  * function will return 403 status error forbidden.
//  * @param req.user.role : user role ('regular' or 'admin').
//  */
// export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user || req.user.role === 'regular') {
//     return res.status(403).json({
//       apiVersion,
//       error: {
//         code: 403,
//         message: 'User forbidden',
//       },
//     });
//   }

//   return next();
// };
