/**
 * Container helper using react-meteor-data.
 */

import React from 'react';
//import { ReactMeteorData } from 'meteor/react-meteor-data';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export function createContainer(options = {}, Component) {
  if (typeof options === 'function') {
    options = {
      getMeteorData: options
    }
  }

  const {
    getMeteorData,
    pure = true
  } = options;

  const mixins = [];
  if (pure) {
    mixins.push(PureRenderMixin);
  }

  /* eslint-disable react/prefer-es6-class */
  return React.createClass({
    displayName: 'DataContainer',
    mixins,
    getMeteorData() {
      return [];
    },
    render() {
      return <Component {...this.props} {...this.data}/>;
    }
  });
}
