import {isArray} from './type';

const toArray = ( val ) => isArray( val ) ? val : [ val ];

export class SimpleEvent {
	constructor( type, props = {} ) {
		this.type = type;
		this.defaultPrevented = false;

		Object.assign( this, props );
	}

	preventDefault() {
		this.defaultPrevented = true;
	}
}

export const emitSimpleEvent = ( target, type, props ) => {
	let ev = new SimpleEvent( type, props );
	target.emit( type, ev );
	return ev;
};

export default class EventEmitter {
	constructor( names ) {
		this._listeners = {};

		const _this = this;

		if ( isArray( names ) ) {
			names.forEach( name => {
				try {
					let callback = null;

					Object.defineProperty( _this, ( 'on-' + name ).replace( /-(\w)/g, ( _, m ) => m.toUpperCase() ), {
						enumerable: false,
						get: () => callback,
						set: ( cb ) => {
							callback && _this.off( name, callback );
							cb && _this.on( name, callback = cb );
						},
					} );
				} catch ( er ) {
					console.error( er );
				}
			} );
		}
	}

	listenerCount( type ) {
		return this._listeners[ type ]?.length || 0;
	}

	emit( type, ...args ) {
		toArray( type ).forEach( type => this.listenerCount( type ) && this._listeners[ type ].forEach( func => func.call( this, ...args ) ) );
		return this;
	}

	on( type, func ) {
		toArray( type ).forEach( type => ( this._listeners[ type ] ||= [] ).push( func ) );
		return this;
	}

	off( type, func ) {
		toArray( type ).forEach( type => {
			if ( isArray( this._listeners[ type ] ) ) {
				this._listeners[ type ] = this._listeners[ type ].filter( _func => func !== _func );
			} else {
				delete this._listeners[ type ];
			}
		} );

		return this;
	}
}

var _proto = EventEmitter.prototype;

Object.defineProperties( _proto, {
	addEventListener: { value: _proto.on },
	removeEventListener: { value: _proto.off },
	attachEvent: { value: _proto.emit },
} );
