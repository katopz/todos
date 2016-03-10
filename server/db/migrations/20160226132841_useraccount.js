
// copied with minor changes from https://github.com/meteor/postgres-packages/blob/master/examples/react-todos/.knex/migrations/20150817153755_accounts.js

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("users", function (table) {
      table.increments(); // integer id
      table.string("username").notNullable();

      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    }),


    knex.schema.createTable("users_emails", function (table) {
      table.increments(); // integer id

      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

      table.integer("user_id").notNullable();
      table.string("address").unique().notNullable();
      table.boolean("verified").defaultTo(false).notNullable();
    }),

    //knex.raw("ALTER TABLE users_services ADD CONSTRAINT skvi UNIQUE (service_name, key, value, id_if_not_unique);")
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("users"),
    knex.schema.dropTable("users_emails")
  ]);
};
