import React from 'react';
import { Link } from 'react-router';
import listAPI from '../../api/lists.js';

export default class ListList extends React.Component {
  createNewList() {
    const { router } = this.context;
    const listPromise = listAPI.insert({name:'new list'},(err) => {
      if (err) {
        router.push('/');
        /* eslint-disable no-alert */
        alert('Could not create list.');
      }
    });
    listPromise.then( res => {
      let listId = res.createList.id; 
      router.push(`/lists/${ listId }`);
    });
  }

  render() {
    const lists = this.props.lists;
    return (
      <div className="list-todos">
        <a className="link-list-new" onClick={this.createNewList.bind(this)}>
          <span className="icon-plus"></span>
          New List
        </a>
        {lists.map(list => (
          <Link
            to={`/lists/${ list.id }`}
            key={list.id}
            title={list.name}
            className="list-todo"
            activeClassName="active">
            {list.userId
              ? <span className="icon-lock"></span>
              : null}
            {list.incompleteCount
              ? <span className="count-list">{list.incompleteCount}</span>
              : null}
            {list.name}
          </Link>
        ))}
      </div>
    );
  }
}

ListList.propTypes = {
  lists: React.PropTypes.array
};

ListList.contextTypes = {
  router: React.PropTypes.object
};
