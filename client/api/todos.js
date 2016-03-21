import { ApolloClient } from '../ui/helpers/ApolloClient.js';

let client = new ApolloClient('http://localhost:3000/graphql');
//XXX I'm defining the client multiple times, but it should be defined only once

export default {

    setCheckedStatus: ({todoId, checked}) => {
      console.log('set checked status for', todoId);
      return client.mutation( {
        mutation: `mutation {
          updateTodo(id: ${todoId}, checked: ${checked}){
            id,
            text
          }
        }`,
        args: { '$todoId': todoId, '$checked': checked }
      });
    },
    updateText: ({todoId, newText}) => {
      return client.mutation( {
        mutation: `mutation updateText($todoId: ID!, $newText: String){
          updateTodo(id: $todoId, text: $newText){
            id,
            text
          }
        }`,
        args: { 'todoId': todoId, 'newText': newText }
      });
    },
    insert: ({listId, text}) => {
      return client.mutation( {
        mutation: `mutation createTodo($listId: ID, $text: String){
          createTodo(text: $text, list_id: $listId){
            id,
            text
          }
        }`,
        args: { 'text': text, 'listId': listId }
      });
    },
    remove: ({todoId}) => {
      return client.mutation( {
        mutation: `mutation removeTodo($todoId: ID!){
          deleteTodo(id: $todoId)
        }`,
        args: { 'todoId': todoId }
      });
    }
};

