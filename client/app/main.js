import { render } from 'react-dom';
import { renderRoutes } from './routes.jsx';
require( '!style!css!less!./main.less');

render(renderRoutes(), document.getElementById('app'));
