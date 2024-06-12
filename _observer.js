import {useEffect, useState} from 'react';
import {isArray, isFunction, isIterable, isString} from './type';

const set = ( map, key, val ) => {
	map.set( key, val );
	return val;
};


const lObservables = /*window.lObservables = */new Map();
const lSubscribers = /*window.lSubscribers = */new Map();
const gObservables = /*window.gObservables = */new Map();
const gSubscribers = /*window.gSubscribers = */new Set();

const nan = ( arg ) => typeof arg === 'number' && isNaN( arg );
const equals = ( a, b ) => a === b || nan( a ) && nan( b );

const runObserver = () => {
	let mutations = new Map();

	for ( let observable of lObservables ) {
		let [ target, { store } ] = observable;

		for ( let key in store ) {
			if ( !equals( store[ key ], target[ key ] ) ) {
				store[ key ] = target[ key ];
				( mutations.get( target ) || set( mutations, target, new Set() ) ).add( key );
			}
		}
	}

	if ( mutations.size ) {
		for ( let subscriber of lSubscribers ) {
			let [ update, [ target, fields ] ] = subscriber;

			let mutationFields = mutations.get( target );

			if ( mutationFields ) {
				if ( fields.find( key => mutationFields.has( key ) ) ) {
					update( {} );
				}
			}
		}
	}

	for ( let observable of gObservables ) {
		let [ weakRef, [ store ] ] = observable;
		let target = weakRef.deref();

		if ( target ) {
			for ( let key in store ) {
				if ( !equals( store[ key ], target[ key ] ) ) {
					store[ key ] = target[ key ];
					mutations = null;
				}
			}
		} else {
			gObservables.delete( weakRef );
		}
	}

	if ( !mutations ) {
		for ( let update of gSubscribers ) {
			update( {} );
		}
	}

	requestAnimationFrame( runObserver );
};

requestAnimationFrame( runObserver );
// setInterval( runObserver, 100 );

export const _useObserver = (target, fields ) => {
	let state = useState();

	useEffect( () => {
		if ( target ) {
			_observe( state[ 1 ], target, fields );
			return () => _removeObservable( state[ 1 ] );
		}
	}, [ target ] );

	return target;
}

export const _observer = (baseComponent ) => {
	return ( props ) => {
		let state = useState();

		useEffect( () => {
			gSubscribers.add( state[ 1 ] );
			return () => gSubscribers.delete( state[ 1 ] );
		}, [] );

		return baseComponent( props );
	};
};

const _findGlobalObservable = ( target ) => {
	for ( let observable of gObservables ) {
		let [ weakRef, data ] = observable;

		if ( weakRef.deref() === target ) {
			return data;
		}
	}
};

const _makeObservable = ( target, fields = Object.keys( target ), ignore ) => {
	if ( fields.length ) {
		let [ store, keys ] = ( () => {
			return _findGlobalObservable( target );
		} )() || set( gObservables, new window.WeakRef( target ), [ {}, new Set() ] );

		for ( let key of fields ) {
			if ( !ignore && !keys.has( key ) ) {
				store[ key ] = target[ key ];
			}

			keys.add( key );
		}
	}
};

export const makeObservable = ( target, fields ) => {
	_makeObservable( target, fields, false );
};

export const getObservable = ( target ) => {
	let data = _findGlobalObservable( target );

	if ( data ) {
		return [ ...data[ 1 ] ];
	}
};

export const ignoreObservable  = ( target, fields ) => {
	_makeObservable( target, fields, true );
};

const _observe = ( update, target, fields = Object.keys( target ) ) => {
	if ( !isIterable( fields ) ) {
		throw 'fields cna be only iterable';
	}

	let data = lObservables.get( target ) || set( lObservables, target, { store: {}, fields: {} } );

	for ( let key of fields ) {
		data.store[ key ] = target[ key ];
		data.fields[ key ] = data.fields[ key ] + 1 || 1;
	}

	lSubscribers.set( update, [ target, fields ] );
};

const _removeObservable = ( update ) => {
	let [ target, fields ] = lSubscribers.get( update );
	lSubscribers.delete( update );

	let data = lObservables.get( target );

	fields.forEach( key => {
		if ( !--data.fields[ key ] ) {
			delete data.store[ key ];
		}
	} );

	if ( !Object.keys( data.store ).length ) {
		lObservables.delete( target );
	}
};

///////////////////////////////////////////////////////////////////////////////

const createObjectStore = ( target, input ) => {
	if ( !input ) {
		input = `{${ Object.keys( target ).join( ' ' ) }}`;
	}

	let path = [];
	let store = {};

	for ( const match of ( 'target ' + input ).matchAll( /(\w+)\s*(\{|\})?/g ) ) {
		let [ all, key, brace ] = match;

		if ( brace === '{' ) {
			path.push( key );
		} else {
			let value;
			key = path.join( '.' ) + '.' + key;

			try { value = eval( key ) } catch ( er ) {}

			store[ key ] = value;

			if ( brace ) {
				path.pop();
			}
		}
	}

	return store;
};

const updateObjectStore = ( target, store ) => {
	let updates = 0;

	for ( const key in store ) {
		let newValue;

		try {
			newValue = eval( key );
		} catch ( er ) {}

		if ( !equals( newValue, store[ key ] ) ) {
			updates++;
		}

		store[ key ] = newValue;
	}

	return updates;
};

const updateArrayStore = ( array, store ) => {
	let updates = 0;

	if ( array.length !== store.length ) {
		store.length = array.length;
		updates++;
	}

	array.forEach( ( value, i ) => {
		if ( !updates && !equals( store[ i ], value ) ) {
			updates++;
		}

		store[ i ] = value;
	} );

	return updates;
};

let localObserver = new Map();

setInterval( () => {
	if ( document.visibilityState === 'visible' ) {
		for ( const localObserverElement of localObserver ) {
			let [ update, [ target, store, updateStore ] ] = localObserverElement;

			if ( updateStore( target, store ) ) {
				update( {} );
			}
		}
	}
}, 100 );

export const useObserver = ( target, fields ) => {
	let [ updated, update ] = useState( {} );

	useEffect( () => {
		update( {} );

		if ( target ) {
			if ( isArray( target ) ) {
				localObserver.set( update, [ target, [ ...target ], updateArrayStore ] );
			} else {
				localObserver.set( update, [ target, createObjectStore( target, fields ), updateObjectStore ] );
			}

			return () => localObserver.delete( update );
		}
	}, [ target ] );

	return updated;
}
