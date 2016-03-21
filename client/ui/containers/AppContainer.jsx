//import { Lists } from '../../api/lists/lists.js';
//import { createContainer } from '../helpers/create-container.jsx';
import App from '../layouts/App.jsx';
import { ApolloClient } from '../helpers/ApolloClient.js';

let client = new ApolloClient('http://localhost:3000/graphql');
//XXX I'm defining the client multiple times, but it should be defined only once


let AppContainer = client.createContainer({
  defaultVars: { connected: true, loading: false, user: null },
  query: (props) => { return `query
    {
        allLists{
              id
            name
            user_id
            incomplete_count
          },
        currentUser{
          id
          username
        }
    }
  `},
  component: App,
  pollingInterval: 500
});

export default AppContainer;
