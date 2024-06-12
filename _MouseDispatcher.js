import {vec2} from './threejs-tools';
import EventEmitter from './EventEmitter';

const MOUSE_LEFT_CODE = 0;
const MOUSE_MIDDLE_CODE = 1;
const MOUSE_RIGHT_CODE = 2;

const buttons = {
	[ MOUSE_LEFT_CODE ]: [ 'left', 'MouseLeft' ],
	[ MOUSE_MIDDLE_CODE ]: [ 'middle', 'MouseMiddle' ],
	[ MOUSE_RIGHT_CODE ]: [ 'right', 'MouseRight' ],
};

export const _MouseDispatcher = new EventEmitter();

_MouseDispatcher.page = vec2( window.innerWidth / 2, window.innerHeight / 2 );
_MouseDispatcher.left = null;
_MouseDispatcher.middle = null;
_MouseDispatcher.right = null;
_MouseDispatcher.buttons = new Set();

const pointerDown = ( { button, pageX, pageY } ) => {
	pointerUp( { button } );

	let [ key, name ] = buttons[ button ];

	_MouseDispatcher[ key ] = vec2( pageX, pageY );
	_MouseDispatcher.buttons.delete( button );
	_MouseDispatcher.buttons.delete( key );
	_MouseDispatcher.buttons.delete( name );
};

const pointerUp = ( { button } ) => {
	let [ key, name ] = buttons[ button ];

	_MouseDispatcher[ key ] = null;
	_MouseDispatcher.buttons.delete( button );
	_MouseDispatcher.buttons.delete( key );
	_MouseDispatcher.buttons.delete( name );
};

const pointerMove = ( { pageX, pageY } ) => {
	_MouseDispatcher.page.set( pageX, pageY );
};

window.addEventListener( 'mousedown', pointerDown );
window.addEventListener( 'mousemove', pointerMove );
window.addEventListener( 'mouseup', pointerUp );

window.addEventListener( 'blur', () => {
	_MouseDispatcher.left = null;
	_MouseDispatcher.middle = null;
	_MouseDispatcher.right = null;
	_MouseDispatcher.buttons.clear();
} );
