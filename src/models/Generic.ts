import Objection, { Model } from 'objection';

/**
 * Generic is a base model that all other models should extend from.
 */
class Generic extends Model {
  // Default attributes on every table.
  id!: number;

  // The date of creation of the object.
  createdAt!: Date;

  // The date of last modification of the object.
  updatedAt!: Date;

  // Map database table into snake cases.
  static columnNameMappers = Objection.snakeCaseMappers();
}

export default Generic;
