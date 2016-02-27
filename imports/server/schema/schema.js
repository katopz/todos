import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./db/dev.sqlite3"
  },
  debug: true
});

let userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { 
      type: GraphQLString,
      resolve: function(user){
        return user.username;
      }
    },
    lists: {
      type: new GraphQLList(listType),
      resolve: function(user){
        return knex.select("*").from("lists").where({user_id: user.id});
      }
    }
  })
});

let listType = new GraphQLObjectType({
  name: 'List',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    incomplete_count: { 
      type: GraphQLInt,
      resolve: (list) => {
        console.log(list.id);
        return knex('todos')
          .where({list_id: list.id, checked: false})
          .count('* as num')
          .then( 
            (res) => { 
              return res[0]['num']
            }
          );
      }
    }, //really? should be a query.
    created_at: { type: GraphQLString },
    user: {
      type: userType,
      resolve: function(list){
        console.log("user id: %s", list.user_id );
        return knex.select("*")
                .from("users")
                .where({id: list.user_id})
                .limit(1)
                .then((res)=>{ return res[0]});
      }
    },
    todos: {
      type: new GraphQLList(todoType),
      resolve: function(list){
        return knex.select("*").from("todos").where({ list_id: list.id});
      }
    }
  })
});

let todoType = new GraphQLObjectType({
  name: 'Todo',
  fields: {
    id: { type: GraphQLID },
    text: { type: GraphQLString },
    created_at: { type: GraphQLString },
    list: { 
      type: listType, 
      resolve: function(todo){
        return knex.select("*")
                .from("lists")
                .where( {id: todo.list_id})
                .limit(1)
                .then((res)=>{ return res[0]});
      }
    },
    checked: { type: GraphQLBoolean }
  }
});
    
// TODO: if this grows, split out the mutations and queries into separate file
export const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: userType,
        args: {
          id: { type: GraphQLID }
        },
        description: "Get user by Id",
        resolve: function(root, {id}) {
          return knex.select("*")
                .from("users")
                .where({id: id})
                .limit(1)
                .then((res)=>{ return res[0]});
        }
      },
      allUsers: {
        //TODO: need to authenticate the user here
        type: new GraphQLList( userType ),
        description: "Get a list of all users (just for fun)",
        args: { 
          id: { type: GraphQLID }
        },
        resolve: function(){
           return knex.select("*").from("users"); //TODO: filter by what user can see
         }
      },
      list: {
        //TODO: need to authenticate the user here
        type: listType,
        description: "Get a specific todo list",
        args: { 
          id: { type: GraphQLID }
        },
        resolve: function(root, {id}){
           return knex.select("*")
                  .from("lists")
                  .where({id: id}).limit(1)
                  .then((res)=>{ return res[0]}); //TODO: filter by what user can see
         }
      },
      allLists: {
        //TODO: need to authenticate the user here
        type: new GraphQLList(listType),
        description: "Get all todo lists the user can see",
        resolve: function(root){
          return knex.select('*').from('lists');
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createTodo: {
        type: todoType,
        args: {
          text: { type: GraphQLString },
          list_id: { type: GraphQLID },
        },
        resolve: (root, {text, list_id} ) => {
          return knex("todos").insert({
            text: text,
            list_id: list_id
          }).then( (res) => {
            return knex
                .select("*")
                .from("todos")
                .where({ id: res[0] })
                .limit(1)
          })
          .then( (res) => {
            return res[0];
          });
        }
      },

      updateTodo: {
        type: todoType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          text: { type: GraphQLString },
          checked: { type: GraphQLBoolean }
        },
        resolve: (root, {id, text, checked}) => {
          //this works if either text or checked are set
          //but it breaks when none are set
          return knex('todos')
            .where({id: id})
            .update({
              text: text,
              checked: checked
            })
          .then( (res) => {
            return knex('todos')
            .where({id: id})
            .limit(1)
          })
          .then((res)=>{
            return res[0]
          });
        },
      },

      deleteTodo: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID }
        },
        resolve: (root, {id}) => {
          return knex('todos').where({id: id}).del();
        }
      },

      createList:
      {
        type: listType,
        args:
        {
          name: { type: new GraphQLNonNull(GraphQLString) },
          user_id: { type: GraphQLID }
        },
        resolve: (root, {name, user_id}) => {
          return knex('lists')
            .insert({name: name, user_id: user_id})
            .then( (res) => {
            return knex
                .select("*")
                .from("lists")
                .where({ id: res[0] })
                .limit(1)
            })
            .then( (res) => {
              return res[0];
            });
        }
      },

      updateList: {
        type: listType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: GraphQLString },
          user_id: { type: GraphQLID }
        },
        resolve: (root, {id, name, user_id}) => {
          //this works if either text or checked are set
          //but it breaks when none are set
          return knex('lists')
            .where({id: id})
            .update({
              name: name,
              user_id: user_id
            })
          .then( (res) => {
            return knex('lists')
            .where({id: id})
            .limit(1)
          })
          .then((res)=>{
            return res[0]
          })
        },
      },

      deleteList: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID }
        },
        resolve: (root, {id}) => {
          return knex('lists').where({id: id}).del();
        }
      }
    }
  })
});
