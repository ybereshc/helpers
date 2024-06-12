import {isArray, isObject, isString} from './type';

export default class EventRegister {
	static add( target, type, callback, options ) {
		let reg = new EventRegister();

		reg.add( target, type, callback, options );

		return () => reg.clear();
	}

	constructor( target ) {
		this._all = [];
		this._target = target;
	}

	add( target, type, callback, options ) {
		if ( isString( target ) ) {
			target = this._target;
			type = target;
			callback = type;
			options = callback;
		}

		let targets = ( isArray( target ) ? target : [ target ] );
		let types = ( isArray( type ) ? type : [ type ] );
		let callbacks = ( isArray( callback ) ? callback : [ callback ] );

		targets.forEach( target => {
			if ( isObject( options ) ) {
				let { run, once } = options;

				if ( run ) {
					callbacks.forEach( callback => callback.call( target ) );

					if ( once ) {
						return;
					}
				}
			}

			types.forEach( type => {
				callbacks.forEach( callback => {
					target.addEventListener( type, callback, options );
					this._all.push( { target, type, callback } );
				} );
			} );
		} );
	}

	remove( target, type, callback ) {
		if ( isString( target ) ) {
			target = this._target;
			type = target;
			callback = type;
		}

		let targets = ( isArray( target ) ? target : [ target ] );
		let types = ( isArray( type ) ? type : [ type ] );
		let callbacks = ( isArray( callback ) ? callback : [ callback ] );

		targets.forEach( target => {
			types.forEach( type => {
				callbacks.forEach( callback => {
					target.removeEventListener( type, callback );
					this._all = this._all.filter( ev => ev.target !== target || ev.type !== type || ev.callback !== callback );
				} );
			} );
		} );
	}

	clear() {
		this._all.forEach( ( { target, type, callback } ) => target.removeEventListener( type, callback ) );
		this._all.length = 0;
	}
}