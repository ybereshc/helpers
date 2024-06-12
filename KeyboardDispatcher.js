import EventEmitter from './EventEmitter';
// import { isMacOs, isWindows } from 'react-device-detect';
import {isArray} from './type';

export var KeyboardDispatcher = ( () => {
	// var isLinux = !isMacOs && !isWindows;

	class KeyboardDispatcher extends EventEmitter {
		constructor() {
			super();

			this.keys = {};
			this.shortCuts = [];

			var codes = [];
			var callbacks = null;

			var keyDown = ( code, ev ) => {
				if ( !this.keys[ code ] ) {
					this.keys[ code ] = ev;

					if ( this.shortCuts.length ) {
						codes = Object.keys( this.keys );
						callbacks = null;
					}

					this.emit( 'keydown', ev );
				}

				this.emit( 'keypress', ev );

				if ( this.shortCuts.length ) {
					if ( !callbacks ) {
						callbacks = this.shortCuts.filter( ( { keys } ) => {
							if ( keys.length === codes.length ) {
								if ( codes.findIndex( ( code, i ) => keys[ i ] !== code && keys[ i ] !== this.keys[ code ].key ) < 0 ) {
									return true;
								}
							}
						} );
					}

					callbacks.forEach( ( { callback } ) => callback( ev ) );
				}
			};

			var keyUp = ( code, ev = null ) => {
				if ( this.keys[ code ] ) {
					ev ??= new KeyboardEvent('keyup', this.keys[ code ] );
					delete this.keys[ code ];
					this.emit( 'keyup', ev );
				}
			};

			window.addEventListener( 'keydown', ( ev ) => keyDown( ev.code, ev ) );
			window.addEventListener( 'keyup', ( ev ) => keyUp( ev.code, ev ) );
			window.addEventListener( 'blur', () => Object.keys( this.keys ).forEach( code => keyUp( code ) ) );
		}

		onShortCut( keys, callback ) {
			if ( !isArray( keys ) ) {
				keys = keys.split( /[\s+]+/ );
			}

			this.shortCuts.push( { type: keys.join( ' ' ), keys, callback } );
		}

		offShortCut( keys, callback ) {
			if ( !isArray( keys ) ) {
				keys = keys.split( /[\s+]+/ );
			}

			var type = keys.join( ' ' );

			this.shortCuts = this.shortCuts.filter( shortCut => shortCut.type !== type || shortCut.callback !== callback );
		}
	}

	return new KeyboardDispatcher();
} )();
