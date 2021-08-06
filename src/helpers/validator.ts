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
 * @param userId - The user id that going to exclude from the validation.
 */
export const isUniqueUsername = async (username: string, userId?: string): Promise<boolean> => {
  // The default user id is empty.
  let id = '';
  if (userId) {
    id = userId;
  }

  // Query the user from database.
  const user = await User.query().whereNot({ id }).andWhere({ username }).first();
  // Negate the user, if user not already exist it will return true.
  return (!user);
};
