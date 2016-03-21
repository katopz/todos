import { ApolloClient } from '../ui/helpers/ApolloClient.js';

let client = new ApolloClient('http://localhost:3000/graphql');
//XXX I'm defining the client multiple times, but it should be defined only once

export default {
    createUser: ({username, password}) => {
      return client.mutation( {
        mutation: `mutation createUser($username: String!, $password: String!){
          createUser(username: $username, password: $password){
            id,
            username
          }
        }`,
       args: { 'username': username, 'password': password }
      });
    },
};

