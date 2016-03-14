import { Schema } from './schema/schema.js';
import graphqlHTTP from 'express-graphql';
import express from 'express';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';

require('./auth.js');
import session from 'express-session';
import passport from 'passport';

const app = express();
const PORT = 3000;

app.use(session({
  genid: function(req) {
    return uuid.v4();
  },
  secret: 'Z3]GJW!?9uP"/Kpe'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/graphql', 
  (req, res, next) => {
    if(req.isAuthenticated()){
      return next();
    } else {
      res.send(401);
      return;
    }
  },
  graphqlHTTP( (req) => ({ 
    schema: Schema,
    graphiql: true,
    rootValue: { auth: { userId: null, user: req.user } }
  }))
);


app.use( bodyParser.urlencoded({ extended: true }) );
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failuerRedirect: '/',
  failureFlash: true
}) );


var proxyMiddleware = require('http-proxy-middleware');
var proxy = proxyMiddleware('/', {
  target: 'http://localhost:8080',
  pathRewrite: {
    '^/.*/$':'',
    '^.*bundle.js$': '/bundle.js'  
  }
});

app.use(proxy);

app.listen(PORT, () => {
 console.log("GraphQL server listening on port %s", PORT); 
});
