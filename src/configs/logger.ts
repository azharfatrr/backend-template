const logConf = {
  appenders: {
    access: {
      type: 'dateFile',
      filename: 'logs/access.log',
      pattern: '-yyyy-MM-dd',
      category: 'http',
    },
    app: {
      type: 'file',
      filename: 'logs/app.log',
      maxLogSize: 10485760,
      numBackups: 3,
    },
    errorFile: {
      type: 'file',
      filename: 'logs/errors.log',
    },
    errors: {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: 'errorFile',
    },
    console: {
      type: 'console',
    },
  },
  categories: {
    default: { appenders: ['app', 'errors', 'console'], level: 'DEBUG' },
  },
  pm2: process.env.NODE_ENV === 'production',
  disableClustering: process.env.NODE_ENV === 'production',
};

export default logConf;
