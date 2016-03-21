import { ApolloClient } from '../ui/helpers/ApolloClient.js';

let client = new ApolloClient('http://localhost:3000/graphql');
//XXX I'm defining the client multiple times, but it should be defined only once

export default {

    updateName: ({listId, newName}) => {
      return client.mutation( {
        mutation: `mutation updateName($listId: ID!, $newName: String){
          updateList(id: $listId, name: $newName){
            id,
            name
          }
        }`,
        args: { 'listId': listId, 'newName': newName }
      });
    },
    makePrivate: ({listId}) => {
      return client.mutation( {
        mutation: `mutation makeListPrivate($listId: ID!){
          makeListPrivate(id: $listId)
        }`,
        args: { 'listId': listId }
      });
    },
    makePublic: ({listId}) => {
      return client.mutation( {
        mutation: `mutation setListOwner($listId: ID!, $ownerId: ID!){
            updateList(id: $listId, user_id: $ownerId){
              id,
              name,
              user{ id }
            }
        }`,
        args: { 'listId': listId, 'ownerId': 0 }
      });
    },
    insert: ({name}) => {
      return client.mutation( {
        mutation: `mutation createList($name: String!){
            createList(name: $name){
              id,
              name,
              user{ id }
            }
        }`,
        args: { 'name': name }
      });
    },
    remove: ({listId}) => {
      return client.mutation( {
        mutation: `mutation removeList($listId: ID!){
          deleteList(id: $listId)
        }`,
        args: { 'listId': listId }
      });
    }
};

