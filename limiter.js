export const limiter = ( limit = 1 ) => {
	let queue = [];

	limit = ( limit < 1 ? 0 : limit ) || Infinity;

	const run = async () => {
		let needsReRun = false;

		while ( queue.length && limit ) {
			limit--;

			let [ resolve, reject, callback ] = queue.shift();

			try {
				resolve( await callback() );
			} catch ( er ) {
				reject( er );
			}

			limit++;

			needsReRun = true;
		}

		needsReRun && run();
	}

	return ( callback ) => {
		let promise = new Promise( ( resolve, reject ) => queue.push( [ resolve, reject, callback ] ) );

		run();

		return promise;
	}
};

export const limiterCallback = ( callback, limit = 1 ) => {
	const limiterFunc = limiter( limit );
	return ( ...args ) => limiterFunc( () => callback( ...args ) );
};
