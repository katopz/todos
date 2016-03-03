var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./db/dev.sqlite3"
  },
  debug: true
});

export const DB = {

  Lists: {
    all(){
      return knex.select('*').from('lists');
    },

    get(list_id){
       return knex.select("*")
        .from("lists")
        .where({id: list_id}).limit(1)
        .then((res)=>{ return res[0]}); //TODO: filter by what user can see
    },

    get_incomplete_count(list_id) {
      console.log('list id %s', list_id);
      return knex('todos')
        .where({list_id: list_id, checked: false})
        .count('* as num')
        .then( 
          (res) => { 
            console.log(res);
            return res[0]['num']
          }
        );
    },

    get_todos(list_id){
      return knex.select("*").from("todos").where({ list_id: list_id});
    },

    set_name(list_id, name) {
      return;
    },

    set_user(list_id, user_id){
      return;
    },

    create(name, user_id){
      return knex('lists').insert({name: name, user_id: user_id})
    },

    update(id, name, user_id){
      //this works if either name or user_id are set
      //but it breaks if neither is set
      return knex('lists')
        .where({id: id})
        .update({
          name: name,
          user_id: user_id
        });
    },

    delete(list_id){
      return knex('lists').where({id: list_id}).del();
    }
  },

  Users: {
    get(user_id){
      return knex.select("*")
        .from("users")
        .where({id: user_id})
        .limit(1)
        .then((res)=>{ return res[0]});
    },

    all(){
     return knex.select("*").from("users"); //TODO: filter by what user can see
    },

    get_lists(user_id){
      return knex.select("*").from("lists").where({user_id: user_id});
    }
  },

  Todos: {

    get(todo_id){
      return knex.select("*")
        .from("todos")
        .where({id: todo_id})
        .limit(1)
        .then((res)=>{ return res[0]});
    },

    create(text, list_id){
      console.log('creating todo');
      return knex("todos").insert({
        text: text,
        list_id: list_id
      });
    },

    update(todo_id, new_text, new_checked){
      //this works if either text or checked are set
      //but it breaks when none are set
      return knex('todos')
        .where({id: todo_id})
        .update({
          text: new_text,
          checked: new_checked
       });
    },

    setText(todo_id, new_text){
      return;
    },

    setChecked(todo_id, new_checked){
      return;
    },

    delete(todo_id){
      return knex('todos').where({id: todo_id}).del();
    }
    
  }
};
