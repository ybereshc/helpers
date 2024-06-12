export const Timeout = ( callback, timeout ) => {
	let resolve, promise = new Promise( a => resolve = a );

	promise.clear = () => resolve();

	let lastTimeStamp = Date.now();

	let id = setTimeout( () => {
		if ( id ) {
			try {
				resolve( callback.call( promise, Date.now() - lastTimeStamp ) );
			} catch ( er ) {
				console.error( er );
			}
		}
	}, timeout );

	promise.then( () => ( clearInterval( id ), id = 0 ) );

	return promise;
};

export const Interval = ( callback, timeout ) => {
	let resolve, res, promise = new Promise( a => resolve = a );

	promise.clear = () => resolve( res );

	let lastTimeStamp = Date.now();

	let id = setInterval( () => {
		if ( id ) {
			let timeStamp = Date.now();

			try {
				res = callback.call( promise, timeStamp - lastTimeStamp );
			} catch ( er ) {
				console.error( er );
			}

			lastTimeStamp = timeStamp;
		}
	}, timeout );

	promise.then( () => ( clearInterval( id ), id = 0 ) );

	return promise;
};

export const AnimationFrame = ( callback ) => {
	let resolve, res, promise = new Promise( a => resolve = a );

	promise.clear = () => resolve( res );

	let lastTimeStamp;

	let animate = ( timeStamp ) => {
		if ( id ) {
			id = requestAnimationFrame( animate );

			try {
				res = callback.call( promise, timeStamp - lastTimeStamp || 0 );
			} catch ( er ) {
				console.dir( er );
			}

			lastTimeStamp = timeStamp;
		}
	};

	let id = requestAnimationFrame( animate );

	promise.then( () => ( cancelAnimationFrame( id ), id = 0 ) );

	return promise;
};
