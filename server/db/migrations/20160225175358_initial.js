
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("lists", function(table){
      table.increments();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.string("user_id").defaultTo(null);
      table.string("name").notNullable();

    }),
    knex.schema.createTable("todos", function(table){
      table.increments();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.integer("list_id").notNullable();
      table.string("text").notNullable();
      table.boolean("checked").defaultTo(false).notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("lists"),
    knex.schema.dropTable("todos")
  ]);
};
