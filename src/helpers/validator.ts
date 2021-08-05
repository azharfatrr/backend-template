import validator from 'validator';

import User from '../models/User';

/**
 * isValidId is a function for validate input id is numeric(integer) or not.
 * @param id - The id you want to validate.
 */
export const isValidId = (id: string): boolean => !Number.isNaN(+id)
 && Number.isInteger(parseFloat(id));

/**
 * isValidEmail is a function for validate input email is valid or not.
 * @param email - The email you want to validate.
 */
export const isValidEmail = (email: string): boolean => validator.isEmail(email);

/**
 * isUniqueUsername is a function for validate input username is unique or not.
 * @param username - The username you want to validate.
 */
export const isUniqueUsername = async (username: string): Promise<boolean> => {
  // Query the user from database.
  const user = await User.query().where({ username }).first();
  // Negate the user, if user not already exist it will return true.
  return (!user);
};
