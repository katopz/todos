import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLError,
} from 'graphql';

import { DB } from './db.js';

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    lists: {
      type: new GraphQLList(listType),
      resolve: user => {
        return DB.Users.get_lists(user.id);
      },
    },
    password_hash: {
      // XXX this is just here so I can check it from GraphiQL. Remove, please.
      type: GraphQLString,
      resolve: user => {
        return DB.Users.get_password_hash(user.id);
      },
    },
  }),
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
      },
    }, // really? should be a query.
    created_at: { type: GraphQLString },
    user_id: { type: GraphQLID },
    user: {
      type: userType,
      resolve: list => {
        return DB.Users.get(list.user_id);
      },
    },
    todos: {
      type: new GraphQLList(todoType),
      resolve: list => {
        return DB.Lists.get_todos(list.id);
      },
    },
  }),
});

let todoType = new GraphQLObjectType({
  name: 'Todo',
  fields: {
    id: { type: GraphQLID },
    text: { type: GraphQLString },
    created_at: { type: GraphQLString },
    list: {
      type: listType,
      resolve: todo => {
        return DB.Lists.get(todo.list_id);
      },
    },
    checked: { type: GraphQLBoolean },
  },
});

// TODO: if this grows, split out the mutations and queries into separate file
export const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: userType,
        args: {
          id: { type: GraphQLID },
          token: { type: GraphQLString },
        },
        description: 'Get user by Id - if you have the right token',
        resolve: (root, { id }) => {
          return DB.Users.get(id);
        },
      },

      currentUser: {
        type: userType,
        description: 'Get info of currently logged in user',
        resolve: root => {
          if (root.auth.userId) {
            return DB.Users.get(root.auth.userId);
          }
          return null;
        },
      },

      allUsers: {
        // TODO: need to authenticate the user here
        type: new GraphQLList(userType),
        description: 'Get a list of all users (just for fun)',
        args: {
          id: { type: GraphQLID },
        },
        resolve: () => {
          return DB.Users.all();
        },
      },
      list: {
        // TODO: need to authenticate the user here
        type: listType,
        description: 'Get a specific todo list',
        args: {
          id: { type: GraphQLID },
        },
        resolve: (root, { id }) => {
          return DB.Lists.get(id);
        },
      },
      allLists: {
        // TODO: need to authenticate the user here
        type: new GraphQLList(listType),
        description: 'Get all todo lists the user can see',
        resolve: root => {
          return DB.Lists.all(root.auth.userId);
        },
      },
      todos: {
        type: new GraphQLList(todoType),
        description: 'Get all todos for one list',
        args: {
          list_id: {
            type: GraphQLID,
            description: 'The list id',
          },
        },
        resolve: (root, { list_id }) => {
          return DB.Lists.get_todos(list_id);
        },
      },
    },
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
        resolve: (root, { text, list_id }) => {
          return DB.Todos.create(text, list_id).then(
            (res) => {
              return DB.Todos.get(res[0]);
            }
          );
        },
      },

      updateTodo: {
        type: todoType,
        // TODO: use an input type here!
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          text: { type: GraphQLString },
          checked: { type: GraphQLBoolean },
        },
        resolve: (root, { id, text, checked }) => {
          return DB.Todos.update(id, text, checked).then(
            () => {
              return DB.Todos.get(id);
            }
          );
        },
      },

      deleteTodo: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID },
        },
        resolve: (root, { id }) => {
          return DB.Todos.delete(id);
        },
      },

      createUser:
      {
        type: userType,
        args: {
          username: { type: GraphQLString },
          password: { type: GraphQLString },
        },
        resolve: (root, { username, password }) => {
          return DB.Users.createWithPassword(username, password).then(
            (userId) => {
              return DB.Users.get(userId);
            }
          );
        },
      },

      getSessionToken:
      {
        type: GraphQLString,
        args: {
          username: { type: GraphQLString },
          password: { type: GraphQLString },
        },
        resolve: (root, { username, password }) => {
          return DB.Users.getSessionToken(username, password);
        },
      },

      // XXX: maybe return a boolean?
      logoutSession:
      {
        type: GraphQLInt,
        args: {
          token: { type: GraphQLString },
        },
        resolve: (root, { token }) => {
          return DB.Users.deleteToken(token);
        },
      },

      logoutAllSessions:
      {
        type: GraphQLInt,
        args: {
          token: { type: GraphQLString },
        },
        resolve: (root, { token }) => {
          return DB.Users.getUserIdForToken(token)
            .then(
              (userId) => {
                return DB.Users.logoutAllSessionsForUser(userId);
              }
            );
        },
      },


      // not actually a mutation, just want it to be executed serially!
      checkSessionToken:
      {
        type: GraphQLID,
        args: {
          token: { type: GraphQLString },
        },
        resolve: (root, { token }) => {
          return DB.Users.getUserIdForToken(token).then(
            (userId) => {
              root.auth.userId = userId;
              return userId;
            });
        },
      },

      createList:
      {
        type: listType,
        args:
        {
          name: { type: new GraphQLNonNull(GraphQLString) },
          userId: { type: GraphQLID },
        },
        resolve: (root, { name, userId }) => {
          if (userId && userId !== root.auth.userId) {
            return new GraphQLError(`not authorized. You are ${root.auth.userId}`);
          }
          return DB.Lists.create(name, userId).then(
            (res) => {
              return DB.Lists.get(res[0]);
            }
          );
        },
      },

      updateList: {
        type: listType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: GraphQLString },
          userId: { type: GraphQLID },
        },
        resolve: (root, { id, name, userId }) => {
          const userIdValue = userId !== 0 ? userId : null;
          return DB.Lists.update(id, name, userIdValue).then(
            () => {
              return DB.Lists.get(id);
            }
          );
        },
      },

      makeListPrivate: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID },
        },
        resolve: (root, { id }) => {
          if (root.auth.userId) {
            return DB.Lists.update(id, undefined, root.auth.userId);
          }
          throw new GraphQLError('Anonymous user cannot make list private');
        },
      },

      deleteList: {
        type: GraphQLInt,
        args: {
          id: { type: GraphQLID },
        },
        resolve: (root, { id }) => {
          return DB.Lists.delete(id);
        },
      },
    },
  }),
});
