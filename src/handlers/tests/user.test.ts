import request from 'supertest';
import dotenv from 'dotenv';

import { jwtCookieName } from '../../configs/server';

// Get the environment variables.
dotenv.config({ path: `${__dirname}/../../.env` });

// Create new superagent from baseURL.
const baseURL = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
  || 'http://localhost:8000';
const superagent = request.agent(baseURL);

// The user id to use for testing.
const userId: Number[] = [];

// The admin data for login.
const adminData = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
};

// The user data for login.
const userData = {
  username: process.env.USER_USERNAME,
  password: process.env.USER_PASSWORD,
};

// The token after login and needed for authentication of requests by admin.
let tokenAdmin: string;

// getToken is a function for get the JWT from the request Response.
const setToken = (res: request.Response) => {
  // Get the cookies.
  const { 'set-cookie': cookies } = res.headers;
  // Search the cookies that contains the jwt token.
  const jwtCookie = cookies.find((cookie: string) => cookie.includes(jwtCookieName));
  // Set the token with the jwt.
  return jwtCookie.split(';').find((jwtInfo: string) => jwtInfo.includes(jwtCookieName));
};

// Login the admin before all test executed.
beforeAll(async () => {
  // Create a request to login the admin.
  const res = await superagent.post('/api/v1/auth/login').send(adminData);
  tokenAdmin = setToken(res);
});

// Delete all users in userId after all tests.
afterAll((done) => {
  // Foreach user id.
  userId.forEach((Id) => {
    superagent.delete(`/api/v1/users/${Id}`);
  });
  done();
});

// The unit testing for creating a new user.
// Only the admin that can create a new user.
describe('POST /api/v1/admin/users', () => {
  // TEST #1: Success create a new admin user.
  it('Should create a new admin', async () => {
    // The user data for testing.
    const payload = {
      firstName: 'Testing',
      lastName: 'Admin',
      username: 'admin1',
      password: 'test123',
      email: 'test123@gmail.com',
      role: 'admin',
    };

    // Create a new request.
    const res = await superagent
      .post('/api/v1/admin/users')
      .send(payload)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(201);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('data');
    // Validate the data of the response.
    expect(res.body.data).toHaveProperty('firstName', payload.firstName);
    expect(res.body.data).toHaveProperty('lastName', payload.lastName);
    expect(res.body.data).toHaveProperty('username', payload.username);
    expect(res.body.data).toHaveProperty('email', payload.email);
    expect(res.body.data).toHaveProperty('role', payload.role);

    // Add the setting id for another unit testing.
    userId.push(res.body.data.id);
  });

  // TEST #2: Success create a new user.
  it('Should create a new user', async () => {
    // The user data for testing.
    const payload = {
      firstName: 'Testing',
      lastName: 'User',
      username: 'user1',
      password: 'test123',
      email: 'test123@gmail.com',
      role: 'user',
    };

    // Create a new request.
    const res = await superagent
      .post('/api/v1/admin/users')
      .send(payload)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(201);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('data');
    // Validate the data of the response.
    expect(res.body.data).toHaveProperty('firstName', payload.firstName);
    expect(res.body.data).toHaveProperty('lastName', payload.lastName);
    expect(res.body.data).toHaveProperty('username', payload.username);
    expect(res.body.data).toHaveProperty('email', payload.email);
    expect(res.body.data).toHaveProperty('role', payload.role);

    // Add the setting id for another unit testing.
    userId.push(res.body.data.id);
  });

  // TEST #3: Fail to create a new user because of missing fields.
  it('Should not create a new user because some property is missing', async () => {
    // The user data for testing.
    const payload = {
      lastName: 'User',
      username: 'user2',
      password: 'test123',
      email: 'test123@gmail.com',
      role: 'user',
    };

    // Create a new request.
    const res = await superagent
      .post('/api/v1/admin/users')
      .send(payload)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(400);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('error');
  });

  // TEST #4: Fail to create a new user because username alread exists.
  it('Should not create a new user because username already taken', async () => {
    // The user data for testing.
    const payload = {
      firstName: 'Testing',
      lastName: 'User',
      username: 'user1',
      password: 'test123',
      email: 'test123@gmail.com',
      role: 'user',
    };

    // Create a new request.
    const res = await superagent
      .post('/api/v1/admin/users')
      .send(payload)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(400);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('error');
  });
});

// The unit testing for get a user by Id.
describe('GET /api/v1/users/:userId', () => {
  // TEST #1: Success get a user by Id.
  it('Should get a user by Id', async () => {
    // The id of the user for testing.
    const id = userId[Math.floor(Math.random() * userId.length)];

    // Create a new request.
    const res = await superagent
      .get(`/api/v1/users/${id}`)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(200);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('data');
    // Validate the data of the response.
    // Validate the data of the response.
    expect(res.body.data).toHaveProperty('firstName');
    expect(res.body.data).toHaveProperty('lastName');
    expect(res.body.data).toHaveProperty('username');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('role');
  });

  // TEST #2: Fail get a user by Id because the user does not exist.
  it('Should not get a user by Id because the user does not exist', async () => {
    // The id of the user for testing.
    const id = 999999; // definitely wont exist

    // Create a new request.
    const res = await superagent
      .get(`/api/v1/users/${id}`)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(404);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('error');
  });

  // TEST #3: Fail get a user by Id because the Id is not valid.
  it('Should not get a user by Id because the the Id is not valid.', async () => {
    // The id of the user for testing.
    const id = 'hehehe'; // definitely wont exist

    // Create a new request.
    const res = await superagent
      .get(`/api/v1/users/${id}`)
      .set('Cookie', tokenAdmin)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(400);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('error');
  });

  // TEST #4: Fail get a user by Id because the user is not authorized.
  it('Should not get a user by Id because the user is not authorized', async () => {
    // Create a request to login the user.
    const resUser = await superagent.post('/api/v1/auth/login').send(userData);
    const tokenUser = setToken(resUser);

    // The id of the user for testing.
    const id = userId[Math.floor(Math.random() * userId.length)];

    // Create a new request.
    const res = await superagent
      .get(`/api/v1/users/${id}`)
      .set('Cookie', tokenUser)
      .set('Accept', 'application/json');

    // Validate the status code.
    expect(res.status).toEqual(403);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('error');
  });
});

// // The unit testing for getting setting.
// describe('GET /api/v1/settings/:settingKey', () => {
//   // Fetch existing setting (created in previous test).
//   it('Should fetch single existing setting', async () => {
//     // Create a new request.
//     // Note that the you get the key of setting from previous test.
//     const res = await superagent
//       .get('/api/v1/settings/noWa')
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(200);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('data');
//     // Validate the data of the response.
//     expect(res.body.data).toHaveProperty('key', 'noWA');
//     expect(res.body.data).toHaveProperty('value', '+62-813-5556-66');
//     // 1 = true.
//     expect(res.body.data).toHaveProperty('isPublic', 1);
//   });

//   // Failed to fetch data with settingId valid because data with that
//   // settingId not exist in database.
//   it('Failed to fetch setting because the data does not exist in databse', async () => {
//     // Create a new request.
//     const res = await superagent
//       .get('/api/v1/settings/1000')
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(404);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 404);
//     expect(res.body.error).toHaveProperty('message', 'Setting with specified name not exist!');
//   });

//   // Failed to fetch data because the settingId is not a number.
//   it('Failed to fetch setting because the settingId is invalid', async () => {
//     // Create a new request.
//     const res = await superagent
//       .get('/api/v1/settings/aaa##@__  11')
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(400);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 400);
//     expect(res.body.error).toHaveProperty('message', 'Invalid settingKey params!');
//     expect(res.body.error).toHaveProperty('errors');
//     expect(res.body.error.errors).toContainEqual({
//       message: 'settingKey must only contain letter and number!',
//       location: 'settingKey',
//       locationType: 'params',
//     });
//   });
// });

// // The unit testing for updating setting.
// describe('PUT /api/v1/settings/:settingId', () => {
//   it('Should update single setting with valid data', async () => {
//     // Create a new request.
//     // Note that the you get the id of setting from previous test.
//     const res = await superagent
//       .put(`/api/v1/settings/${settingId[0]}`)
//       .send({
//         key: 'noPemilik',
//         value: '+62-813-777-6621',
//         isPublic: false,
//       })
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(200);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('data');
//     // Validate the data of the response.
//     expect(res.body.data).toHaveProperty('key', 'noPemilik');
//     expect(res.body.data).toHaveProperty('value', '+62-813-777-6621');
//     expect(res.body.data).toHaveProperty('isPublic', 0);
//   });

//   // Failed to update setting because the key is already used and isPublic is not provided.
//   it('Should failed to update setting data because key is not unique and isPublic is not provided', async () => {
//     // Create a new request.
//     const res = await superagent
//       .put(`/api/v1/settings/${settingId[1]}`)
//       .send({
//         key: 'noPemilik',
//         value: '+62-813-777-6621',
//       })
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(400);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 400);
//     expect(res.body.error).toHaveProperty('message', 'Failed during input validation');
//     expect(res.body.error).toHaveProperty('errors');
//     expect(res.body.error.errors).toContainEqual({
//       message: 'isPublic attribute must be provided',
//       location: 'isPublic',
//       locationType: 'body',
//     });
//     expect(res.body.error.errors).toContainEqual({
//       message: 'Key is not unique',
//       location: 'key',
//       locationType: 'body',
//     });
//   });

//   it('Should failed to update setting data because key is invalid and settingId params is also invalid', async () => {
//     // Create a new request.
//     const res = await superagent
//       .put('/api/v1/settings/aaamwk=')
//       .send({
//         key: '',
//         value: '+62-813-777-6621',
//         isPublic: true,
//       })
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(400);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 400);
//     expect(res.body.error).toHaveProperty('message', 'Failed during input validation');
//     expect(res.body.error).toHaveProperty('errors');
//     expect(res.body.error.errors).toContainEqual({
//       message: 'Key must only contain letter and number',
//       location: 'key',
//       locationType: 'body',
//     });
//     expect(res.body.error.errors).toContainEqual({
//       location: 'settingId',
//       locationType: 'params',
//       message: 'settingId field must be numeric value',
//     });
//   });
//   it('Failed to update setting because the data does not exist in database', async () => {
//     // Create a new request.
//     const res = await superagent
//       .put('/api/v1/settings/110000')
//       .send({
//         key: 'Test',
//         value: '+62-813-777-6621',
//         isPublic: true,
//       })
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(404);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 404);
//     expect(res.body.error).toHaveProperty('message', 'Setting with specified id not exist');
//   });
// });

// // The unit testing for deleting setting.
// describe('DELETE /api/v1/settings/:settingId', () => {
//   it('Should delete single existing setting', async () => {
//     // Create a new request.
//     // Note that the you get the id of setting from previous test.
//     const res = await superagent
//       .delete(`/api/v1/settings/${settingId[1]}`)
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(200);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('deleted');
//     // Validate the data of the response.
//     expect(res.body.deleted).toEqual(true);
//   });

//   // Failed to delete data with settingId valid because data with that
//   // settingId not exist in database.
//   it('Failed to delete setting because the data does not exist in databse', async () => {
//     // Create a new request.
//     const res = await superagent
//       .delete('/api/v1/settings/1000')
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(404);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 404);
//     expect(res.body.error).toHaveProperty('message', 'Setting with specified id not exist!');
//   });

//   // Failed to delete data because the setting id is not a number.
//   it('Failed to delete setting because the settingId is invalid', async () => {
//     // Create a new request.
//     const res = await superagent
//       .delete('/api/v1/settings/aaa')
//       .set('Accept', 'application/json');

//     // Validate the status code.
//     expect(res.status).toEqual(400);
//     // Validate the body of the response.
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toHaveProperty('code', 400);
//     expect(res.body.error).toHaveProperty('message', 'Invalid settingId params!');
//     expect(res.body.error).toHaveProperty('errors');
//     expect(res.body.error.errors).toContainEqual({
//       message: 'settingId field must be numeric value',
//       location: 'settingId',
//       locationType: 'params',
//     });
//   });
// });
