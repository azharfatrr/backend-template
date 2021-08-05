/**
 * isValidId is a function for validate input id is numeric(integer) or not.
 * @param id - The id you want to validate.
 */
export const isValidId = (id: string): boolean => !Number.isNaN(+id)
 && Number.isInteger(parseFloat(id));
