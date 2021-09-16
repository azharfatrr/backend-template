import Generic from './Generic';

/**
 * Device is the model for IoT devices that connect to the server.
 */
class Device extends Generic {
  // The id of device that used by the user.
  deviceId!: string;

  roomTemp!: number;

  roomRH!: number;

  userTemp!: number;

  userSpO2!: number;

  userBPM!: number;

  // Set default table name.
  static get tableName() {
    return 'user';
  }
}

/**
 * Type check that will validate if the input is a valid new user.
 */
export const isDevice = (input: any): input is Device => {
  try {
    // Validate the type of input
    if (typeof input.deviceId !== 'string') return false;
    if (typeof input.roomTemp !== 'number') return false;
    if (typeof input.roomRH !== 'number') return false;
    if (typeof input.userTemp !== 'number') return false;
    if (typeof input.userSpO2 !== 'number') return false;
    if (typeof input.userBPM !== 'number') return false;

    return true;
  } catch (err) {
    return false;
  }
};

export default Device;
