import { post } from "jquery";


export const Auth = {
  login(username, password, err_callback){
    console.log('LOGGING IN');
    post('/login', { username: username, password: password }, (res) => {
      console.log('LOGIN',res);
      err_callback(res);
    });
  },

  logout(){
    post('/logout', (res) => {
      console.log('LOGOUT',res);
    });
  }
};
