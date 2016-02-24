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
let lists = [{id: '1', name: 'list 1', incompleteCount: 1, user: '1'}];
let num_lists = lists.length;
let tasks = [
  { 
    id: '1',
    text: 'Task 1',
    list: '1',
    createdAt: new Date(),
    checked: false
  }
];
let num_tasks = tasks.length;

let userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    lists: {
			type: new GraphQLList(listType),
			resolve: function(user){
				return _.filter(lists, { user: user.id });
			}
		}
  })
});

let listType = new GraphQLObjectType({
  name: 'List',
	fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
		incompleteCount: { type: GraphQLInt }, //really? should be a query.
    user: {
			type: userType,
			resolve: function(list){
				return _.find( users, {id: list.user});
			}
		},
		tasks: {
			type: new GraphQLList(taskType),
			resolve: function(list){
				return _.filter(tasks, { list: list.id});
			}
		}
	})
});

let taskType = new GraphQLObjectType({
  name: 'Task',
  fields: {
    id: { type: GraphQLString },
    text: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    list: { 
      type: listType, 
      resolve: function(task){
        return _.find(lists, { id: task.list } );
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
         return _.find( users, { id: id });
        }
      },
      list: {
			//TODO: need to authenticate the user here
			  type: new GraphQLList(listType),
			  description: "Get all todo lists the user can see",
        args: { 
	 			  id: { type: GraphQLString }
			  },
			  resolve: function(){
			  	return _.find(lists, {id: id}); //TODO: filter by what user can see
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
