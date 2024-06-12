import {forEach, mapTo} from './utiles';
import {isArray} from './type';
import EventEmitter from './EventEmitter';

const nan = ( arg ) => typeof arg === 'number' && isNaN( arg );
const equals = ( a, b ) => a === b || nan( a ) && nan( b );

let _id = 0;

export default class HistoryDispatcher extends EventEmitter {
	constructor( getters = {}, setters = {}, compares = {}, require = [], limit = 1000 ) {
		super( [ 'undo', 'redo', 'jump', 'push', 'update', 'clear' ] );

		this._limit = limit | 0;
		this._compares = compares;
		this._getters = getters;
		this._setters = setters;
		this._require = require;
	}

	get undoCount() {
		return this._stack.length - this._redoCount - 1;
	}

	get redoCount() {
		return this._redoCount;
	}

	get _current() {
		return this._stack[ this.undoCount ];
	}

	get current() {
		return mapTo( this._current, ( { data }, key ) => [ key, data ], {} );
	}

	get stack() {
		return this._stack.map( ( { data } ) => data );
	}

	_runSetters( prevStateIndex, state, force = false ) {
		if ( state ) {
			let prevState = this._stack[ prevStateIndex ];

			forEach( this._setters, ( func, key ) => {
				if ( force || state[ key ] !== prevState[ key ] ) {
					func( state[ key ].data );
				}
			} );

			return state;
		}
	}

	_undo() {
		let undoCount = this.undoCount;

		if ( undoCount ) {
			this._redoCount++;

			this.emit( 'undo' );
			this.emit( 'update' );

			this._runSetters( undoCount, this._stack[ this.undoCount ] );
		}
	}

	_redo() {
		if ( this._redoCount ) {
			let undoCount = this.undoCount;

			this._redoCount--;

			this.emit( 'redo' );
			this.emit( 'update' );

			this._runSetters( undoCount, this._stack[ this.undoCount ] );
		}
	}

	_jump( index ) {
		let undoCount = this.undoCount;

		if ( index !== undoCount ) {
			this._redoCount = this._stack.length - 1 - index;

			this.emit( 'jump' );
			this.emit( 'update' );

			this._runSetters( undoCount, this._stack[ this.undoCount ] )
		}
	}

	undo() {
		return this._undo() && this.current;
	}

	redo() {
		return this._redo() && this.current;
	}

	jump( index ) {
		return this._jump( index ) && this.current;
	}

	clear() {
		let initialState = mapTo( this._getters, ( func, key ) => [ key, func() ], {} );

		this._redoCount = 0;
		this._stack = [ mapTo( initialState, ( data, key ) => [ key, { data, id: ++_id } ], {} ) ];

		this.emit( 'clear' );
		this.emit( 'push' );
		this.emit( 'update' );
	}

	push( keys, force = false ) {
		let state = {};

		keys = isArray( keys ) ? keys : Object.keys( this._getters );

		[ ...keys, ...this._require ].forEach( key => {
			if ( !state.hasOwnProperty( key ) ) {
				state[ key ] = this._getters[ key ]();
			}
		} );

		let current = this._current;
		let diff;

		for ( let key in state ) {
			if ( force || !( this._compares[ key ] || equals )( state[ key ], current[ key ].data ) ) {
				( diff ||= {} )[ key ] = { data: state[ key ], id: ++_id };
			}
		}

		if ( diff ) {
			if ( this._redoCount ) {
				this._stack.length -= this._redoCount;
				this._redoCount = 0;
			}

			if ( this._limit <= this._stack.length ) {
				this._stack.splice( 0, this._stack.length - this._limit + 1 );
			}

			this._stack.push( { ...current, ...diff } );

			this.emit( 'push' );
			this.emit( 'update' );

			return this.current;
		}
	}
}