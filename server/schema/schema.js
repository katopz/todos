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

import { DB } from './db.js';

let userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    lists: {
      type: new GraphQLList(listType),
      resolve: function(user){
        return DB.Users.get_lists(user.id);
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
        return DB.Lists.get_incomplete_count(list.id);
      }
    }, //really? should be a query.
    created_at: { type: GraphQLString },
    user_id: { type: GraphQLID },
    user: {
      type: userType,
      resolve: function(list){
        return DB.Users.get(list.user_id);
      }
    },
    todos: {
      type: new GraphQLList(todoType),
      resolve: function(list){
        return DB.Lists.get_todos(list.id);
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
        return DB.Lists.get(todo.list_id);
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
          return DB.Users.get(id);
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
          return DB.Users.all();
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
          return DB.Lists.get(id);
        }
      },
      allLists: {
        //TODO: need to authenticate the user here
        type: new GraphQLList(listType),
        description: "Get all todo lists the user can see",
        resolve: function(root){
          return DB.Lists.all();
        }
      },
      todos: {
        type: new GraphQLList(todoType),
        description: "Get all todos for one list",
        args: {
          list_id: { type: GraphQLID, description: "The list id" }
        },
        resolve: function( root, {list_id} ){
          return DB.Lists.get_todos(list_id);
        }
      },
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
          return DB.Todos.create(text, list_id).then( (res) => {
            return DB.Todos.get(res[0]);
          });
        }
      },

      updateTodo: {
        type: todoType,
        //TODO: use an input type here!
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          text: { type: GraphQLString },
          checked: { type: GraphQLBoolean }
        },
        resolve: (root, {id, text, checked}) => {
          return DB.Todos.update(id, text, checked).then( (res) => {
            return DB.Todos.get(id);
          });
        },
      },

      deleteTodo: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID }
        },
        resolve: (root, {id}) => {
          return DB.Todos.delete(id);
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
          return DB.Lists.create(name, user_id).then( (res) => {
            return DB.Lists.get( res[0] );
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
          return DB.Lists.update(id, name, user_id).then( (res) => {
            return DB.Lists.get(id);
          });
        },
      },

      deleteList: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID }
        },
        resolve: (root, {id}) => {
          return DB.Lists.delete(id);
        }
      }
    }
  })
});
