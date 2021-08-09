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
// TODO: CHANGE THIS DATA TO admin admin.
const adminData = {
  username: 'azharfatrr',
  password: '123456',
};

// The token after login and needed for authentication of requests by admin.
let token: string;

// Login the admin before all test executed.
beforeAll((done) => {
  superagent.post('/api/v1/auth/login')
    .send(adminData)
    .end((err, res) => {
      // Get the cookies.
      const { 'set-cookie': cookies } = res.headers;
      // Search the cookies that contains the jwt token.
      const jwtCookie = cookies.find((cookie: string) => cookie.includes(jwtCookieName));
      // Set the token with the jwt.
      token = jwtCookie.split(';').find((jwtInfo: string) => jwtInfo.includes(jwtCookieName));
      done();
    });
});

// The unit testing for creating a new setting.
describe('POST /api/v1/admin/users', () => {
  // Create a success single public setting.
  it('Should create a new single user by admin', async () => {
    // Create a new request.
    const res = await superagent
      .post('/api/v1/admin/users')
      .send({
        firstName: 'Testing',
        lastName: 'Test',
        username: 'test123',
        password: 'test456',
        email: 'test123@gmail.com',
        role: 'user',
      })
      .set('Cookie', token)
      .set('Accept', 'application/json');

    console.log(res.body);
    // Validate the status code.
    expect(res.status).toEqual(201);
    // Validate the body of the response.
    expect(res.body).toHaveProperty('data');
    // Validate the data of the response.
    // expect(res.body.data).toHaveProperty('key', 'noWA');
    // expect(res.body.data).toHaveProperty('value', '+62-813-5556-66');
    // expect(res.body.data).toHaveProperty('isPublic', true);

    // Add the setting id for another unit testing.
    userId.push(res.body.data.id);
  });

  // // Create a success single non-public setting.
  // it('Should create a new single setting not public', async () => {
  //   // Create a new request.
  //   const res = await superagent
  //     .post('/api/v1/settings')
  //     .send({
  //       key: 'noHP',
  //       value: '+62-813-5556-66',
  //     })
  //     .set('Accept', 'application/json');

  //   // Validate the status code.
  //   expect(res.status).toEqual(201);
  //   // Validate the body of the response.
  //   expect(res.body).toHaveProperty('data');
  //   // Validate the data of the response.
  //   expect(res.body.data).toHaveProperty('key', 'noHP');
  //   expect(res.body.data).toHaveProperty('value', '+62-813-5556-66');
  //   expect(res.body.data).toHaveProperty('isPublic', false);

  //   // Add the setting id for another unit testing.
  //   settingId.push(res.body.data.id);
  // });

  // // Failed to create setting because the key is already used (in testcase above).
  // it('Should not create a new single setting because key not unique', async () => {
  //   // Create a new request.
  //   const res = await superagent
  //     .post('/api/v1/settings')
  //     .send({
  //       key: 'noWA',
  //       value: '+62-813-5556-66',
  //     })
  //     .set('Accept', 'application/json');

  //   // Validate the status code.
  //   expect(res.status).toEqual(400);
  //   // Validate the body of the response.
  //   expect(res.body).toHaveProperty('error');
  // });

  // // Failed to create setting because key is not provided (it is required element).
  // it('Should not create a new single setting because key not provided', async () => {
  //   // Create a new request.
  //   const res = await superagent
  //     .post('/api/v1/settings')
  //     .send({
  //       value: '+62-813-5556-66',
  //     })
  //     .set('Accept', 'application/json');

  //   // Validate the status code.
  //   expect(res.status).toEqual(400);
  //   // Validate the body of the response.
  //   expect(res.body).toHaveProperty('error');
  // });
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
