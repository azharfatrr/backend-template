import Generic from './Generic';

/**
 * User is the model for a entity that connect to the system.
 */
class User extends Generic {
  firstName!: string;

  lastName!: string;

  username!: string;

  hash: string;

  salt: string;

  picture: string;

  email!: string;

  // Check authorization, the value can be 'admin' or 'user'.
  role!: string;

  // Get public data of user.
  getPublicData() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      picture: this.picture,
    };
  }

  // Get public authorized data of user.
  getAuthorizedData() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      picture: this.picture,
      role: this.role,
    };
  }

  // Check if the user is admin.
  isAdmin() {
    return this.role === 'admin';
  }

  // Set default table name.
  static get tableName() {
    return 'user';
  }
}

/**
 * Type check that will validate if the input is a valid new user.
 */
export const isUser = (input: any): input is User => {
  try {
    // Validate the type of input
    if (typeof input.firstName !== 'string') return false;
    if (typeof input.lastName !== 'string') return false;
    if (typeof input.username !== 'string') return false;
    if (typeof input.email !== 'string') return false;

    // TODO: Validate if picture is valid.

    // Validate the role
    if (input.role !== 'admin' && input.role !== 'user') return false;

    return true;
  } catch (err) {
    return false;
  }
};

export default User;
