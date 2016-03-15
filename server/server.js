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
      console.log('authenticated as ', req.user.id);
      console.log( JSON.stringify(req.session) );
      return next();
    } else {
      console.log('unauthorized, but will let through');
      console.log( JSON.stringify(req.session) );
      return next();
    }
  },
  graphqlHTTP( (req) => ({ 
    schema: Schema,
    graphiql: true,
    rootValue: { auth: { userId: req.user && req.user.id, user: req.user } }
  }))
);


app.use( bodyParser.urlencoded({ extended: true }) );
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(user){
      req.logIn(user, err => {console.error(err);});
      res.send(JSON.stringify(user));
    } else {
      res.send(401);
    }
  })(req, res, next);
  next();
});

app.post('/logout', function(req, res){
  req.logout();
  res.send(200);
});

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
