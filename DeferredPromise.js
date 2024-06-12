function DeferredPromise( timeout ) {
	let res, rej, promise = new Promise( ( a, b ) => ( res = a, rej = b ) );

	promise.resolve = res;
	promise.reject = rej;

	if ( timeout ) {
		let id = setTimeout( () => rej(), timeout );
		promise.then( () => clearTimeout( id ) );
	}

	return promise;
}

export default DeferredPromise;