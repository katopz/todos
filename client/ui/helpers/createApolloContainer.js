/**
 * Helper method for easier creation of data containers
 * with react-komposer + lokka
 */

import { compose } from 'react-komposer';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

const client = new Lokka({
  transport: new Transport('http://localhost:3000/graphql')
});

export function createApolloContainer( options , Component) {

  const {
    defaultVariables,
    fragments
  } = options;

  const onPropsChange = (props, onData) => {

    // patch query together by putting all the fragments into it.
    

   client.query( query ).then( result => {
    // extract each fragment from result and put it as a child of data.
    onData(null, data);
   });


    onData(null, getMeteorData(props));
  };
  return compose(onPropsChange)(Component);
}


// actually, what are the requirements for this container class?

class ApolloClient {
  constructor( url ){
    this.connection = new Lokka({
      transport: new Transport( url )
    });
  }



  createContainer(options){
    //XXX check that requried args are present
    // options:
    //  defaultVars
    //  query
    //  component
    //  pollingInterval (optional)

    let runQuery = function( props, onData ){
        this.connection.query( query )
        .then( result => {
          allProps.data = result;
          //XXX handle errors
          onData( null, result );
        });
    }

    const onPropsChangeFn = (props, onData) => {
      let allProps = Object.assign( {}, defaultVariables, allProps );


      let poller = null;
      if( this.pollingInterval > 0){
        poller = setInterval( runQuery.bind(this, props, onData), this.pollingInterval );
      }

      return () => { clearInterval(poller) }; 
    };





  }
}

