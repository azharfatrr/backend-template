/**
 * KnexFile is the configuration file for 3 types of functions:
 * 1. Knex migration server.
 * 2. Knex query.
 * 3. Objection orm query.
 */

/**
 * Database connection configuration.
 */
export const connection = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'backend-template',
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || 'admin',
};

/**
 * Client package and main database query connector.
 */
export const client = 'mysql2';

/**
 * Knex configuration.
 */
export default
{
  development: {
    client,
    connection,
    pool: {
      min: 0,
      max: 20,
    },
    migration: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  staging: {
    client,
    connection,
    pool: {
      min: 0,
      max: 20,
    },
    migration: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client,
    connection,
    pool: {
      min: 0,
      max: 20,
    },
    migration: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
};
