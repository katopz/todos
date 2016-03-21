import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
//import { Lists } from '../../api/lists/lists.js';
import UserMenu from '../components/UserMenu.jsx';
import ListList from '../components/ListList.jsx';
import ConnectionNotification from '../components/ConnectionNotification.jsx';
import Loading from '../components/Loading.jsx';
import { Auth } from '../helpers/auth.js';

const CONNECTION_ISSUE_TIMEOUT = 5000;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false, //XXX what menu??
      showConnectionIssue: false
    };
  }

  // commented out as long as we have no global store
  /*
  componentWillReceiveProps({ loading, children }) {
    // redirect / to a list once lists are ready
    if (!loading && !children) {
      const list = ;
      this.context.router.replace(`/lists/${ list._id }`);
    }
  }*/

  componentDidMount() {
    setTimeout(() => {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({ showConnectionIssue: true });
    }, CONNECTION_ISSUE_TIMEOUT);
  }

  toggleMenu(menuOpen = !this.state.menuOpen) {
    this.setState({ menuOpen: menuOpen });
  }

  logout() {
    Auth.logout(); //umm... what if this fails?
    //XXX currently have to do this to refresh the view. DOH!
    this.context.router.push('/');
    

    // if we are on a private list, we'll need to go to a public one
    //XXX I'll do this later, maybe...
    /*const list = Lists.findOne(this.props.params.id);
    if (list.userId) {
      const publicList = Lists.findOne({ userId: { $exists: false }});
      this.context.router.push(`/lists/${ publicList._id }`);
    }*/
  }

  render() {
    const { menuOpen, showConnectionIssue } = this.state;
    const {
      connected,
      loading,
      data,
      children,
      location
    } = this.props;

    const lists = data.allLists;
    const user = data.currentUser;

    //this is probably broken. It uses session, right?
    const closeMenu = this.toggleMenu.bind(this, false);

    // clone route components with keys so that they can
    // have transitions
    const clonedChildren = children && React.cloneElement(children, {
      key: location.pathname
    });

    return (
      <div id="container" className={menuOpen ? 'menu-open' : ''}>
        <section id="menu">
          <UserMenu user={user} logout={this.logout.bind(this)}/>
          <ListList lists={lists}/>
        </section>
        {showConnectionIssue && !connected
          ? <ConnectionNotification/>
          : null}
        <div className="content-overlay" onClick={closeMenu}></div>
        <div id="content-container">
          <ReactCSSTransitionGroup
            transitionName="fade"
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {loading
              ? <Loading key="loading"/>
              : clonedChildren}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  user: React.PropTypes.object,      // current meteor user
  connected: React.PropTypes.bool,   // server connection status
  loading: React.PropTypes.bool,     // subscription status
  //menuOpen: React.PropTypes.bool,    // is side menu open?
  lists: React.PropTypes.array,      // all lists visible to the current user
  children: React.PropTypes.element, // matched child route component
  location: React.PropTypes.object   // current router location
};

App.contextTypes = {
  router: React.PropTypes.object
};
