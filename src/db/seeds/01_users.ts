import { Knex } from 'knex';
import { genPassword } from '../../helpers/util';

export async function seed(knex: Knex): Promise<void> {
  // Generate the admin hash and salt from password.
  const adminPass = genPassword(process.env.ADMIN_PASSWORD);
  const userPass = genPassword(process.env.USER_PASSWORD);

  // Deletes ALL existing entries
  await knex('user').del();

  // Inserts seed entries
  await knex('user').insert([
    {
      id: 1,
      first_name: 'admin',
      last_name: 'seed',
      username: process.env.ADMIN_USERNAME,
      hash: adminPass.hash,
      salt: adminPass.salt,
      email: 'admin@admin.com',
      role: 'admin',
    },
    {
      id: 2,
      first_name: 'user',
      last_name: 'seed',
      username: process.env.USER_USERNAME,
      hash: userPass.hash,
      salt: userPass.salt,
      email: 'user@user.com',
      role: 'user',
    },
  ]);
}
