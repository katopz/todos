import { Schema } from './schema/schema.js';
import graphqlHTTP from 'express-graphql';
import express from 'express';

const app = express();
const PORT = 3000;
var proxyMiddleware = require('http-proxy-middleware');

var proxy = proxyMiddleware('/', {
  target: 'http://localhost:8080',
  pathRewrite: {
    '^/.*/$':'',
    '^.*bundle.js$': '/bundle.js'  
  }
});

app.use('/graphql', (req, res, next) => {
  res.header( "Access-Control-Allow-Origin", "*" );
  res.header( "Access-Control-Allow-Credentials", "true" );
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.use('/graphql', graphqlHTTP({ schema: Schema, graphiql: true }));
app.use(proxy);

app.listen(PORT, () => {
 console.log("GraphQL server listening on port %s", PORT); 
});
