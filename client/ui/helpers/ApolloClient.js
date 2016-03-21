/**
 * Helper method for easier creation of apollo client containers
 * with react-komposer + lokka
 */

import { compose } from 'react-komposer';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

class ApolloClient {
  constructor( url ){
    this.connection = new Lokka({
      transport: new Transport( url )
    });
  }

  mutation( { mutation, args } ){

    // Lokka mutate doesn't allow vars. DUH!
    console.log('mutatiing', mutation);
    return this.connection.query( mutation, args )
      .then( result => {
        console.log('mutation complete',result);
        return result;
      });

    //XXX this should cause the queries to rerun... not yet sure how.
  }

  createContainer(options){
    //XXX check that requried args are present
    // options:
    //  defaultVars
    //  query
    //  component
    //  pollingInterval (optional)
    let { defaultVars, query, component, pollingInterval = 0 } = options;

    let runQuery = function( query, props, onData, label ){
      let newProps = Object.assign( {}, defaultVars, props );
        this.connection.query( query(props) )
        .then( result => {
          newProps.data = result;
          //XXX handle errors
          onData( null, newProps );
        });
    }

    const onPropsChangeFn = (props, onData) => {
      //XXX this always runs twice, find out why.
      let allProps = Object.assign( {}, defaultVars, props );

      runQuery.call( this, query, allProps, onData, component.name + ' NP' );

      let poller = null;
      if( pollingInterval > 0){
        poller = setInterval( runQuery.bind(this, query, props, onData, component.name + 'P'), pollingInterval );
        console.log('polling at', pollingInterval);
      }

      return () => { if(poller){ console.log('clear interval', poller, component.name); clearInterval(poller)} }; 
    };


    return compose(onPropsChangeFn.bind(this))(component);


  }
}

export { ApolloClient };

