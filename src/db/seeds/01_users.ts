import { Knex } from 'knex';
import { genPassword } from '../../helpers/util';

export async function seed(knex: Knex): Promise<void> {
  // Generate the admin hash and salt from password.
  const adminPass = genPassword(process.env.ADMIN_PASSWORD);

  // Deletes ALL existing entries
  await knex('user').del();

  // Inserts seed entries
  await knex('user').insert([
    {
      id: 1,
      first_name: 'admin',
      last_name: 'admin',
      username: process.env.ADMIN_USERNAME,
      hash: adminPass.hash,
      salt: adminPass.salt,
      email: 'admin@admin.com',
      role: 'admin',
    },
    {
      id: 2,
      first_name: 'xylovia',
      last_name: 'varrick',
      username: 'azharfatrr',
      hash: 'c3b64bb938ded779d45d63fa53623a8f69c896160cbec1e891cf8382d74b0e9176ee2a214a19097ef190c0ecb226f663a15a57a197e0bb101da8ef99296589f4',
      salt: 'e1f9dc74c410d470443a227f6093f0294c037d373255d9a9fab07315b8a32fc2',
      email: 'azharfatrr@gmail.com',
      role: 'user',
    },
  ]);
}
