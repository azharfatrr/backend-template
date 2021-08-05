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

// The options for Passport JWT Strategy.
// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
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
 * @param jwtPayload.id : user id.
 * @param exp : token expired information (ms).
 */
passport.use(
  new JWTStrategy(options, async (payload: jwtPayload, done) => {
    // For refencence, check the payload in util.ts.
    const { data, exp, iat } = payload;

    // Check token expired or not.
    if (Date.now() >= (iat + exp) * 1000) return done(null, false);

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
 * will user passport authenticate function to get user data, if not error user data will add to
 * http request as req.user, if error this function will send error with status 401 unauthorized.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user) => {
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
 * isAdmin function is middleware for checking if user have role admin or not, if not this
 * function will return 403 status error forbidden.
 * @param req.user.role : user role ('regular' or 'admin').
 */
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
