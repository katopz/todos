//import { Lists } from '../../api/lists/lists.js';
import ListPage from '../pages/ListPage.jsx';
import { compose } from 'react-komposer';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
import { ApolloClient } from '../helpers/ApolloClient.js';

let client = new ApolloClient('http://localhost:3000/graphql');


let ListContainer = client.createContainer({
  defaultVars: { listExists: true, loading: false },
  query: (props) => { return `query {
     list(id: ${props.params.id}){
       id,
       name,
       user_id,
       todos{
        id,
        text
        checked
       }
     }
   }`
  },
  component: ListPage,
  pollingInterval: 0
});

export default ListContainer;
