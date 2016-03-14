import passport from 'passport';
let LocalStrategy = require('passport-local').Strategy;

import {DB} from './schema/db.js';

passport.use('local', new LocalStrategy(
  function(username, password, done) {
    
    console.log('checking pw');
    let checkPassword = DB.Users.checkPassword( username, password);

    let getUser = checkPassword.then( (is_login_valid) => {
      if(is_login_valid){
        return DB.Users.getUserByUsername( username );
      } else {
        throw new Error("invalid username or password");
      }
    })
    .then( ( user ) => {
        return done(null, user);
    })
    .catch( (err) => {
      console.log('err', err);
      return done(err);
    });
  }
));


passport.serializeUser(function(user, done) {
  console.log('SERIALIZING', user.id);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('DESERIALIZING', id);
  DB.Users.get(id).then( (user, err) => {
    return done(err, user);
  });
});
