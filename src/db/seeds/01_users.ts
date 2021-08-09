import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user').del();

  // Inserts seed entries
  await knex('user').insert([
    {
      id: 1,
      first_name: 'azhar',
      last_name: 'faturahman',
      username: 'azharfatrr',
      hash: '16bdbe70a263146b6462e2954b43b41b7d1e7c365c3b7a92b6d830eca9b94dc21d46f6421e84953d8390afdcfc9998a195d4ff09fbc3c05616487638f6f88d32',
      salt: '283376ea037499209e6d312b385db07138eeb39a3dcdeb4150c78eb0f1de432e',
      email: 'azharfatrr@gmail.com',
      role: 'admin',
    },
    {
      id: 2,
      first_name: 'xylovia',
      last_name: 'varrick',
      username: 'azharfatrr2',
      hash: 'c3b64bb938ded779d45d63fa53623a8f69c896160cbec1e891cf8382d74b0e9176ee2a214a19097ef190c0ecb226f663a15a57a197e0bb101da8ef99296589f4',
      salt: 'e1f9dc74c410d470443a227f6093f0294c037d373255d9a9fab07315b8a32fc2',
      email: 'azharfatrr2@gmail.com',
      role: 'user',
    },
  ]);
}
