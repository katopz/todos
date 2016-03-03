
exports.up = function(knex, Promise) {
  return Promise.all([
    knex("users").insert({
      username: 'alice'
    }),
    knex("lists").insert([{
      name: "List 1",
      user_id: null
    },{
      name: "Alice's list",
      user_id: 1
    }]),
    knex("todos").insert([{
      text: "Write a mutation that inserts a todo",
      list_id: 1
    },{
      text: "Write a mutation that creates a list",
      list_id: 1
    },{
      text: "Write a mutation that updates a todo",
      list_id: 2
    },{
      text: "Write a mutation that updates a list",
      list_id: 2
    }])
  ]);
};

exports.down = function(knex, Promise) {
  
};
