import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user', (table) => {
    table.increments('id');
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('username').notNullable().unique();
    table.string('hash');
    table.string('salt');
    table.string('picture');
    table.string('email').notNullable();
    table.string('role').notNullable().defaultTo('user');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user');
}
