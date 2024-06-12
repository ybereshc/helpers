export const tryCatch = ( func, catchCallback ) => {
	const error = ( err ) => {
		if ( catchCallback ) {
			if ( catchCallback === true ) {
				console.error( err );
			} else {
				catchCallback( err );
			}
		}
	};

	try {
		let res = func();

		if ( res instanceof Promise ) {
			return res.catch( error );
		}

		return res;
	} catch ( err ) {
		error( err );
	}
};