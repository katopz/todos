import { hashSync, compareSync } from 'bcryptjs';
import uuid from 'node-uuid';

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./db/dev.sqlite3"
  },
  debug: true
});


let returnFirstRow = (res) => {
  console.log('firstrow', res );
  return res[0];
};

let returnFirstRowValue = (key) => {
  return (res) => { return returnFirstRow(res)[key] };
};

export const DB = {

  Lists: {
    all(userId){
      //if userId is null, the list is public
      return knex('lists')
        .select('*')
        .whereNull('user_id')
        .orWhere({ user_id: userId});
    },

    get(list_id){
       return knex.select("*")
        .from("lists")
        .where({id: list_id}).limit(1)
        .then(returnFirstRow); //TODO: filter by what user can see
    },

    get_incomplete_count(list_id) {
      console.log('list id %s', list_id);
      return knex('todos')
        .where({list_id: list_id, checked: false})
        .count('* as num')
        .then( returnFirstRowValue('num') ); // Not really a great idea.
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
        .then(returnFirstRow);
    },

    all(){
     return knex.select("*").from("users"); //TODO: filter by what user can see
    },

    get_lists(user_id){
      return knex.select("*").from("lists").where({user_id: user_id});
    },

    get_password_hash(user_id){
      return knex.select("value")
        .from("users_services")
        .where({user_id: user_id, service_name: 'password'})
        .then( returnFirstRowValue('value') );
    },

    checkPassword( username, password){
      let getUserAndHash = knex("users")
        .join("users_services", "users.id", "=", "users_services.user_id")
        .select("users_services.value as hash", "users.id as user_id")
        .where({
          "users.username": username, 
          "users_services.service_name":"password",
          "users_services.key":"bcrypt"
      }).then( returnFirstRow );
      
      return  getUserAndHash.then( (user_and_hash) => {
          //XXX don't do this sync. use async method
          return compareSync(password, user_and_hash['hash']);
      }).catch( (err) => {
        return false; 
      });
    },


    getUserByUsername( username ){
     return knex('users')
       .select('*')
       .where( { username: username })
       .then( returnFirstRow );
    },


    getSessionToken( username, password ){
      let getUser = DB.Users.checkPassword(username, password)
                  .then( (is_login_valid) => {
                    if( is_login_valid ){
                      return DB.Users.getUserByUsername( username );
                    } else {
                      //XXX Internal errors should be handled differently
                      throw new Error('invalid username or password');
                    }
                  });

      let createToken = getUser.then( (user) => {
          //XXX even though UUID v4 should be unique, we might still want to make sure it actually is
          console.log('user is', user);
          var token = uuid.v4();
          console.log('token',token);
          return knex("users_services")
          .insert({
            "user_id": user['id'],
            "service_name": "sessions",
            "key": "token",
            "value": token,
          }).then( () => {
            //XXX this feels wrong...
            return token;
          });
      });
      
      return createToken.then( (token) => {
        console.log('done token', token);
        return token;
      });
    },

    getUserIdForToken( token ){
      return knex("users_services")
        .select("user_id")
        .where({
          "service_name": "sessions",
          "key": "token",
          "value": token
        })
      .then( returnFirstRowValue("user_id") )
      .catch( () => { throw new Error("invalid token") });
    },

    deleteToken( token ){
      return knex("users_services")
        .where({
          "service_name": "sessions",
          "key": "token",
          "value": token
        }).del()
      .catch( () => { throw new Error("invalid token") });
    },

    logoutAllSessionsForUser( user_id ){
      return knex("users_services")
        .where({
          "service_name": "sessions",
          "key": "token",
          "user_id": user_id
        }).del()
      .catch( () => { throw new Error("invalid user_id") });
    },

    createWithPassword( username, password ){
      //XXX: put this in a transaction, please.
      return knex("users")
        .select("id")
        .where({ username: username })
        .limit(1)
        .then( (res) => {
          if(res.length > 0){
            console.log(res);
            throw new Error("Username exists already");
          }
        })
        .then( (res) => {
          return knex("users")
          .insert({username: username});
        })
        .then( (id_inserted) => {
          console.log('userid',id_inserted[0]);
          return knex("users_services")
          .insert({
            user_id: id_inserted[0],
            service_name: "password",
            key: "bcrypt",
            value: hashSync(password,10)
          }).then( () => {
            return id_inserted[0];
          });
        });

    }
  },

  Todos: {

    get(todo_id){
      return knex.select("*")
        .from("todos")
        .where({id: todo_id})
        .limit(1)
        .then( returnFirstRow );
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
