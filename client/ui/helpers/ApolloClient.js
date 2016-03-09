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



  createContainer(options){
    //XXX check that requried args are present
    // options:
    //  defaultVars
    //  query
    //  component
    //  pollingInterval (optional)
    let { defaultVars, query, component, pollingInterval = 0 } = options;

    let runQuery = function( query, props, onData ){
      console.log('running query');
        this.connection.query( query(props) )
        .then( result => {
          props.data = result;
          //XXX handle errors
          console.log('ondata', result);
          console.log('props', props);
          onData( null, props );
        });
    }
    console.log('this',this);

    const onPropsChangeFn = (props, onData) => {
      //XXX this always runs twice, find out why.
      let allProps = Object.assign( {}, defaultVars, props );

      runQuery.call( this, query, allProps, onData );

      let poller = null;
      if( pollingInterval > 0){
        console.log('polling at', pollingInterval);
        console.error('polling not yet supported');
        //poller = setInterval( runQuery.bind(this, query, props, onData), this.pollingInterval );
      }

      return () => { console.log('clear interval'); clearInterval(poller) }; 
    };


    return compose(onPropsChangeFn.bind(this))(component);


  }
}

export { ApolloClient };

