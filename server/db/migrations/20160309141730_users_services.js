
exports.up = function(knex, Promise) {
  
  return Promise.all([
    knex.schema.createTable("users_services", function (table) {
      table.increments(); // integer id

      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

      table.integer("user_id").notNullable();

      table.string("service_name").notNullable();
      table.string("key").notNullable();
      table.string("value").notNullable();

      // We are going to put a random ID here if this value is not meant to be
      // unique across users
      //table.integer("id_if_not_unique").defaultTo(knex.raw("nextval('users_services_id_seq')"));
    })
  ]);

};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("users_services")
  ]);
};
