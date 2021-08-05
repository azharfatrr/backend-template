import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User';
import { jwtPayload } from '../types/jwt';
import { jwtPrivateKey } from '../configs/passport';
import { jwtExpirationTime } from '../configs/server';

// encodeBase64 returns encoded input string using base64Encoding.
export const encodeBase64 = (input: string): string => Buffer.from(input).toString('base64');

// decodeBase64 returns decoded input string using base64Encoding.
export const decodeBase64 = (input: string): string => Buffer.from(input, 'base64').toString();

/**
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login.
 *
 * @param password - The plain text password
 * @param hash - The hash stored in the database
 * @param salt - The salt stored in the database
 */
export const validPassword = (password: string, hash: string, salt: string) => {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
};

/**
 * This function takes a plain text password and creates a salt and hash out of it.
 * Instead of storing the plaintext password in the database, the salt and hash are
 * stored for security.
 *
 * @param password - The password string that the user inputs to the password field in
 * the register form.
 */
export const genPassword = (password: string): { salt: string, hash: string } => {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt,
    hash: genHash,
  };
};

/**
 * issueJWT is a function for creating a JWT token.
 * @param User - The user object.
 */
export const issueJWT = (user: User) => {
  // The user ID for data in payload.
  const { id } = user;

  // The expiration time for the JWT.
  const expiresIn = jwtExpirationTime;

  // The payload for the JWT.
  const payload = {
    data: {
      user_id: id,
    },
    iat: Date.now(),
  } as jwtPayload;

  // Sign the token payload using the private key.
  const signedToken = jsonwebtoken.sign(payload, jwtPrivateKey,
    { expiresIn, algorithm: 'RS256' });

  // Return the token.
  return signedToken;
};
