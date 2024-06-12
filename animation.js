import {isFunction, isNumeric} from './type';

export let timings = {
	'linear': n => n,

	'ease-in': n => n * n,
	'ease-out': n => n * ( 2 - n ),
	'ease-in-out': n => n < .5 ? 2 * n * n : -1 + ( 4 - 2 * n ) * n,

	'ease-in-cubic': n => n * n * n,
	'ease-out-cubic': n => --n * n * n + 1,
	'ease-in-out-cubic': n => n < .5 ? 4 * n * n * n : ( n - 1 ) * ( 2 * n - 2 ) * ( 2 * n - 2 ) + 1,

	'ease-in-circ': n => 1 - Math.sin( Math.acos( n ) ),
	'ease-out-circ': n => Math.acos( Math.sin( n - 1 ) ),
	'ease-in-out-circ': n => ( n < .5 ? 1 - Math.sin( Math.acos( 2 * n ) ) : Math.sin( Math.acos( 2 * n - 2 ) ) + 1 ) / 2,
};

export const registerTimingFunc = ( name, func ) => timings[ name ] = func;

export const animation = ( callback, duration, timing ) => {
	if ( !isFunction( timing ) ) {
		timing = ( timing ? timings[ timing ] : timings.linear );
	}

	let start = Date.now();

	const func = () => {
		let now = Date.now() - start;

		if ( now ) {
			callback( timing( Math.min( now / duration, 1 ) ) );

			if ( now < duration ) {
				requestAnimationFrame( func );
			}
		}
	};

	requestAnimationFrame( func );

	return ( end = false ) => {
		start = NaN;
		cancelAnimationFrame( func );
		end && callback( 1 );
	};
};

export class Animation {
	constructor( callback, duration, timing ) {
		let res, promise = new Promise( a => res = a );

		let killFunc;

		promise.stop = ( end ) => {
			killFunc();
			end && callback( 1 );
			res( end );
			return promise;
		};

		killFunc = animation( n => {
			if ( n >= 1 ) {
				promise.stop( true );
			} else {
				callback( n );
			}
		}, duration, timing );

		return promise;
	}
}
