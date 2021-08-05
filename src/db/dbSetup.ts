import { knex } from 'knex';
import { Model } from 'objection';

import dev from './knexfile';

/**
 * setupDb is a function for setup database with knex
 */
function setupDb() {
  // Setup the knex config.
  const db = knex(dev.development);

  // Setup the objection connection.
  Model.knex(db);
}

export default setupDb;
