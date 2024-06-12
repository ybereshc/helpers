import EventEmitter from './EventEmitter';

export var MouseDispatcher = ( () => {
	var buttons = [ 'MouseLeft', 'MouseMiddle', 'MouseRight', 'MouseBack', 'MouseForward' ];

	class MouseDispatcher extends EventEmitter {
		constructor() {
			super();

			this.position = null;
			this.buttons = {};

			var buttonDown = ( code, ev ) => {
				if ( code ) {
					if ( !this.buttons[ code ] ) {
						this.buttons[ code ] = ev;
						this.emit( 'mousedown', ev );
					}
				}
			};

			var buttonUp = ( code, ev = null ) => {
				if ( code ) {
					if ( this.buttons[ code ] ) {
						delete this.buttons[ code ];
						this.emit( 'mouseup', ev );
					}
				}
			};


			window.addEventListener( 'mousedown', ( ev ) => buttonDown( buttons[ ev.button ], ev ) );

			window.addEventListener( 'mouseup', ( ev ) => buttonUp( buttons[ ev.button ], ev ) );

			window.addEventListener( 'mousemove', ( ev ) => {
				this.position = ev;
				this.emit( 'mousemove', ev );
			} );

			window.addEventListener( 'click', ( ev ) => this.emit( 'click', ev ) );

			window.addEventListener( 'contextmenu', ( ev ) => this.emit( 'contextmenu', ev ) );

			window.addEventListener( 'blur', () => {
				Object.keys( this.buttons ).forEach( button => buttonUp( button ) );
				this.position = null;
			} );
		}
	}

	return new MouseDispatcher();
} )();