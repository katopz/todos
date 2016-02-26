import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

import _ from 'lodash';

import { Lists } from '../api/lists/lists.js';
import { Todos } from '../api/todos/todos.js';

let Fiber = require('fibers');

let userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    username: { 
      type: GraphQLString,
      resolve: function(user){
        if(user.username){
          return user.username;
        } else {
          return user.emails[0].address;
        }
      }
    },
    lists: {
			type: new GraphQLList(listType),
			resolve: function(user){
				return Lists.find({ userId: user._id }).fetch();
			}
		}
  })
});

let listType = new GraphQLObjectType({
  name: 'List',
	fields: () => ({
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
		incompleteCount: { type: GraphQLInt }, //really? should be a query.
    user: {
			type: userType,
			resolve: function(list){
				return Meteor.users.findOne( {_id: list.userId} );
			}
		},
		todos: {
			type: new GraphQLList(todoType),
			resolve: function(list){
				return Todos.find( { listId: list._id} ).fetch();
			}
		}
	})
});

let todoType = new GraphQLObjectType({
  name: 'Todo',
  fields: {
    _id: { type: GraphQLString },
    text: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    list: { 
      type: listType, 
      resolve: function(todo){
        return Lists.findOne( todo.listId );
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
          id: { type: GraphQLString }
        },
        description: "Get user by Id",
        resolve: function(root, {id}) {
          return Meteor.users.findOne( id );
        }
      },
      allUsers: {
        //TODO: need to authenticate the user here
        type: new GraphQLList( userType ),
        description: "Get a list of all users (just for fun)",
        args: { 
          id: { type: GraphQLString }
        },
        resolve: function(){
           return Meteor.users.find({}).fetch(); //TODO: filter by what user can see
         }
      },
      list: {
        //TODO: need to authenticate the user here
        type: listType,
        description: "Get a specific todo list",
        args: { 
          id: { type: GraphQLString }
        },
        resolve: function(root, {id}){
           return Lists.findOne(id); //TODO: filter by what user can see
         }
      },
      allLists: {
        //TODO: need to authenticate the user here
        type: new GraphQLList(listType),
        description: "Get all todo lists the user can see",
        resolve: function(root){
          return Lists.find().fetch();
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      addTodo: {
        type: todoType,
        args: {
          text: { type: GraphQLString },
          listId: { type: GraphQLID },
        },
        resolve: (root, {text, listId} ) => {
          //issue #1: need to do your own schema validation here. That's no fun. Would be nice if GraphQL did it.
            return new Promise((resolve, something) => {
              let todo = {
                text: text,
                listId: listId,
                createdAt: new Date(),
                checked: false
              };
              Fiber( function(){
                let newId = Todos.insert( todo );
                todo = Todos.findOne( { _id: newId } );
                resolve(todo);
              }).run();
            });
        }
      }
    }
  })
});
