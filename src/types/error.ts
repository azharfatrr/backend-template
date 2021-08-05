/**
 * ErrorInterfaces is an interface for creating a new error that happen in request handler.
 */
export interface ErrorInterfaces {
  message: string;
  location: string;
  locationType: string;
}

/**
 * Append new error message that will be passed as 400 response to the client. This will help during
 * input validation on client form escpecially for generating error message on each inputs.
 * @param validator - Validator that will trigger the error appender.
 * @param errors - Error interface array.
 * @param location - Request location that triggers the error.
 * @param locationType - Request location type that triggers the error.
 * @param message - Custom error message that will be passed to the client.
 */
export const errorAppender = (validator: boolean, errors: ErrorInterfaces[], location: string,
  locationType: string, message?: string) => {
  // Create a default error message if none is provided.
  const defaultMessage = `${location.charAt(0).toUpperCase()}${location.slice(1).toLowerCase()} is not valid.`;

  if (validator) {
    errors.push({
      location,
      locationType,
      message: message || defaultMessage,
    });
  }
};
