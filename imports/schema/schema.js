import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

import _ from 'lodash';

let users = [{id: '1', username: 'alice'}];
let num_users = users.length;
let tasks = [
  { 
    id: '1',
    text: 'Task 1',
    owner: '1',
    secret: false,
    createdAt: new Date(),
    completed: false
  }
];
let num_tasks = tasks.length;

let userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    username: { type: GraphQLString }
  }
});

let taskType = new GraphQLObjectType({
  name: 'Task',
  fields: {
    id: { type: GraphQLString },
    text: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    owner: { 
      type: userType, 
      resolve: function(task){
        return _.find(users, { id: task.owner } );
      }
    },
    secret: { type: GraphQLBoolean },
    completed: { type: GraphQLBoolean }
  }
});
    

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
         return _.find( users, { id: id });
        }
      },
      allTasks: {
       //TODO: need to authenticate the user here
       type: new GraphQLList(taskType),
       description: "Get all tasks",
       resolve: function(){
         return tasks;
       }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
     addTask: {
      type: new GraphQLList(taskType),
      args: {
        text: { type: GraphQLString },
        owner: { type: GraphQLString },
        secret: { type: GraphQLBoolean}
      },
      resolve: (root, {text, owner, secret} ) => {
				//issue #1: need to do your own schema validation here. That's no fun. Would be nice if GraphQL did it.
				let task = {
					id: ++num_tasks,
					text: text,
					owner: owner,
					secret: secret,
					createdAt: new Date(),
					completed: false
				};
        tasks.push( task );
        return tasks;
      }
     }
    }
 })
});
