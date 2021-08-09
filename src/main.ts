import express, { Request, Response } from 'express';
import log4js from 'log4js';
import errorHandler from 'errorhandler';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { defaultPort, apiVersion } from './configs/server';
import routes from './routes/api_v1';
import logConf from './configs/logger';
import setupDb from './db/dbSetup';

/**
 * Server main entry point.
 */
function main() {
  // Read the configs from env file.
  dotenv.config({ path: `${__dirname}/../.env` });

  // Setup the logger.
  log4js.configure(logConf);
  const log = log4js.getLogger('main');

  // Setup express app.
  const app = express();
  const port = process.env.SERVER_PORT || defaultPort;

  // Initialization database.
  setupDb();

  // Global Middleware
  app.use(express.static('./public'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(cookieParser());
  app.use(passport.initialize());

  // TODO: Swagger Documentation
  // const swaggerDocument = YAML.load(path.resolve(__dirname, 'documentation/swagger.yml'));

  // Routing Endpoint.
  app.use('/api/v1', routes);
  // TODO: Swagger Documentation
  // app.use('/docs/v1', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Catch Endpoint not found.
  app.use((_: Request, res: Response) => {
    res.status(404).json({
      apiVersion,
      error: {
        code: 404,
        message: 'Not Found!',
      },
    });
  });

  // Error Handler for development phase.
  if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler());
  }

  // Start listening to port.
  app.listen(port, () => {
    log.info(`Server running on : http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
  });
}

// Start the server.
main();
