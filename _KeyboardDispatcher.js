import EventEmitter from './EventEmitter';
import { isMacOs, isWindows } from 'react-device-detect';

let isLinux = !isMacOs && !isWindows;

export function isFocusFree( targetWindow = window ) {
	let dae = targetWindow.document.activeElement;
	return !( dae.isContentEditable || [ 'input', 'textarea', 'button', 'select' ].find( tag => dae.localName === tag ) );
}

function getKeys( ev ) {
	let { keyCode, code, key, location } = ev;
		let res = [ keyCode, code, key ];

		let side = location === 1 ? 'Left' : 'Right';

		if ( isMacOs ) {
			if ( keyCode === 91 ) {
				res.push( 'Command', `Command${side}`, 'Cmd', `Cmd${side}`, 'Func', `Func${side}` );
			} else if ( keyCode === 18 ) {
				res.push( 'Option', `Option${side}` );
			} else if ( keyCode === 13 ) {
				res.push( 'Return' );

				if ( location === 3 ) {
					res.push( 'NumpadReturn' );
				}
			}
		} else if ( isWindows || isLinux ) {
			if ( keyCode === 17 ) {
				res.push( 'Func', `Func${side}` );
			} else if ( keyCode === 91 ) {
				if ( isWindows ) {
					res.push( 'Windows', `Windows${side}`, 'Win', `Win${side}` );
				} else {
					res.push( 'Super', `Super${side}` );
				}
			}
		}

		if ( keyCode === 17 ) {
			res.push( 'Ctrl', `Ctrl${side}` );
		}

		return res;
}

let _KeyboardDispatcher = new EventEmitter( [ 'keydown', 'keyup', 'keypress' ] );

_KeyboardDispatcher._uniqKeys = new Set();
_KeyboardDispatcher._keys = new Set();

_KeyboardDispatcher.any = (...keys ) => {
	for ( let key of keys ) {
		if ( _KeyboardDispatcher._keys.has( key ) ) {
			return true;
		}
	}

	return false;
}

_KeyboardDispatcher.has = (...keys ) => {
	for ( let key of keys ) {
		if ( !_KeyboardDispatcher._keys.has( key ) ) {
			return false;
		}
	}

	return !!keys.length;
}

_KeyboardDispatcher.only = (...keys ) => {
	return _KeyboardDispatcher.has( ...keys ) && _KeyboardDispatcher._uniqKeys.size === keys.length;
}

window.addEventListener( 'keydown', ( ev ) => {
	let keys = getKeys( ev );
	let keyId = ev.keyCode + ev.location * 1000;

	if ( !_KeyboardDispatcher._uniqKeys.has( keyId ) ) {
		_KeyboardDispatcher._uniqKeys.add( keyId );
		keys.forEach( key => _KeyboardDispatcher._keys.add( key ) );

		isFocusFree() && _KeyboardDispatcher.emit( 'keydown', { event: ev, keys: new Set( keys ) } );
	}

	isFocusFree() && _KeyboardDispatcher.emit( 'keypress', { event: ev, keys: new Set( keys ) } );
} );

window.addEventListener( 'keyup', ( ev ) => {
	let keys = getKeys(ev);

	_KeyboardDispatcher._uniqKeys.delete( ev.keyCode + ev.location * 1000 );
	keys.forEach( key => _KeyboardDispatcher._keys.delete( key ) );

	isFocusFree() && _KeyboardDispatcher.emit('keyup', { event: ev, keys: new Set( keys ) });
} );

window.addEventListener( 'blur', ( ev ) => {
	let keys = [ ..._KeyboardDispatcher._keys ];

	_KeyboardDispatcher._uniqKeys.clear();
	_KeyboardDispatcher._keys.clear();

	isFocusFree() && _KeyboardDispatcher.emit( 'keyup', { event: ev, keys: new Set( keys ) } );
} );

export default _KeyboardDispatcher;
