import log4js from 'log4js';

/**
 * Capture Error Log. Sending the error to sentry and save log files.
 */
export const captureErrorLog = (log: log4js.Logger, msg: string, e: Error) => {
  log.error(`${msg}: ${e.message}`);
};
