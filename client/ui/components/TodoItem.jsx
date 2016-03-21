import React from 'react';
import classnames from 'classnames';
import { throttle } from 'underscore';


import api from '../../api/todos.js';
//XXX umm, why doesn't { setCheckedStatus } work???

console.log('setCheckedStatus', api);


export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);
    //don't update right now
    this.throttledUpdate = throttle(value => {
      if (value) {
        api.updateText({
          todoId: this.props.todo.id,
          newText: value
        }, (err) => {
          err && alert(err.error);
        });
      }
    }, 300);
  }

  setTodoCheckStatus(event) {
    api.setCheckedStatus({
      todoId: this.props.todo.id,
      checked: event.target.checked
    });
  }

  updateTodo(event) {
    this.throttledUpdate(event.target.value);
  }

  deleteTodo() {
    api.remove({
      todoId: this.props.todo.id
    }, (err) => {
      err && alert(err.error);
    });
  }

  onFocus() {
    this.props.onEditingChange(this.props.todo.id, true);
  }

  onBlur() {
    this.props.onEditingChange(this.props.todo.id, false);
  }

  render() {
    const { todo, editing } = this.props;
    const todoClass = classnames({
      'list-item': true,
      checked: todo.checked,
      editing
    });

    return (
      <div className={todoClass}>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={todo.checked}
            name="checked"
            onChange={this.setTodoCheckStatus.bind(this)}/>
          <span className="checkbox-custom"></span>
        </label>
        <input
          type="text"
          defaultValue={todo.text}
          placeholder="Task name"
          onFocus={this.onFocus.bind(this)}
          onBlur={this.onBlur.bind(this)}
          onChange={this.updateTodo.bind(this)}/>
        <a
          className="delete-item"
          href="#"
          onClick={this.deleteTodo.bind(this)}
          onMouseDown={this.deleteTodo.bind(this)}>
          <span className="icon-trash"></span>
        </a>
      </div>
    );
  }
}

TodoItem.propTypes = {
  todo: React.PropTypes.object,
  editing: React.PropTypes.bool
};
