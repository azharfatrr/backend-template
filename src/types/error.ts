/**
 * ErrorInterfaces is an interface for creating a new error that happen in request handler.
 */
interface ErrorInterfaces {
  message: string;
  location: string;
  locationType: string;
}

/**
 * ErrorContainer is a class for collecting all error that happen in the program especially
 * while validating input request body.
 */
export class ErrorContainer {
  // The errors array of ErrorInterfaces.
  public errors: ErrorInterfaces[];

  /**
  * Constructor for InputValidatorError
  */
  constructor() {
    this.errors = [];
  }

  /**
  * Append new error message that will be passed as 400 response to the client.
  * This will help during input validation on client form escpecially for generating error message
  * on each inputs.
  * @param location - Request location that triggers the error.
  * @param locationType - Request location type that triggers the error.
  * @param message - Custom error message that will be passed to the client.
  */
  public addError = (location: string, locationType: string, message?: string): void => {
    // Create a default error message if none is provided.
    const defaultMessage = `${location.charAt(0).toUpperCase()}${location.slice(1).toLowerCase()} is not valid.`;

    this.errors.push({
      location,
      locationType,
      message: message || defaultMessage,
    });
  };

  /**
   * Check if there is any error in the error list.
   */
  public hasErrors = (): boolean => this.errors.length > 0

  /**
   * Returns the error list that will be passed to the client.
   */
  public getErrors = (): ErrorInterfaces[] => this.errors;
}
