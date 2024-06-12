const nan = ( arg ) => typeof arg === 'number' && isNaN( arg );
const equals = ( a, b ) => a === b || nan( a ) && nan( b );

export const getStamp = ( getters, keys = Object.keys( getters ) ) => keys.reduce( ( res, key ) => ( res[ key ] = getters[ key ](), res ), {} );

export const setRenderObserver = ( getters, callback, timeout ) => {
	const keys = Object.keys( getters );

	let dispose = () => {
		dispose = false;
		cancelAnimationFrame( animate );
	};

	let value = getStamp( getters, keys );
	let nextCheck = timeout;

	const animate = ( ms ) => {
		if ( dispose ) {
			let needsUpdate = true;

			if ( nextCheck ) {
				if ( nextCheck < ms ) {
					nextCheck = ms + timeout;
				} else {
					needsUpdate = false;
				}
			}

			if ( needsUpdate ) {
				let stamp = getStamp( getters, keys );

				if ( keys.find( key => !equals( value[ key ], stamp[ key ] ) ) ) {
					callback( value = stamp );
				}
			}

			requestAnimationFrame( animate );
		}
	};

	requestAnimationFrame( animate );

	return dispose;
};

export const setIntervalObserver = ( getters, callback, timeout ) => {
	const keys = Object.keys( getters );

	let value = getStamp( getters, keys );

	let timer = setInterval( () => {
		let stamp = getStamp( getters, keys );

		if ( keys.find( key => !equals( value[ key ], stamp[ key ] ) ) ) {
			callback( value = stamp );
		}
	}, timeout );

	return () => clearInterval( timer );
};
