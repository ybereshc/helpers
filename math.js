import {isArray, isString, isUndefined} from './type';

export const PI = Math.PI;
export const TWO_PI = PI * 2;
export const HALF_PI = PI / 2;
export const DEG2RAD = PI / 180;
export const RAD2DEG = 180 / PI;
export const EPSILON = Number.EPSILON;
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
export const MAX_VALUE = Number.MAX_VALUE;
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
export const MIN_VALUE = Number.MIN_VALUE;
export const NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
export const POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

export const map = ( num, min1, max1, min2, max2 ) => ( num - min1 ) * ( max2 - min2 ) / ( max1 - min1 ) + min2;
export const clamp = ( num, min, max ) => num < min ? min : ( num > max ? max : num );
export const loop = ( num, min, max ) => ( num = ( num - min ) % ( max - min ) + min ) < min ? num + ( max - min ) : num;
export const pow = ( x, y ) => Math.pow( x, y );
export const pow2 = ( x ) => Math.pow( x, 2 );
export const pow3 = ( x ) => Math.pow( x, 3 );

export const random = ( min, max ) => {
	let rand = Math.random();

	if ( isUndefined( min ) ) {
		return rand;
	} else if ( isUndefined( max ) ) {
		max = min;
		min = 0;
	}

	return rand * ( max - min ) + min;
};

export const randomInt = ( min, max ) => {
  min = Math.ceil( min );

	if ( isUndefined( max ) ) {
		max = min;
		min = 0;
	} else {
  	max = Math.floor( max );
	}

  return Math.floor(Math.random() * ( max - min ) ) + min;
};

export const uniqStr = ( length = 8, radix = 36 ) => {
	let func, ary = Array( length );

	if ( isString( radix ) || isArray( radix ) ) {
		func = () => radix[ randomInt( radix.length ) ];
	} else {
		func = () => randomInt( radix ).toString( radix );
	}

	for ( let i = 0; i < length; i++ ) {
		ary[ i ] = func();
	}

	return ary.join( '' );
};

export const fitContain = ( imgWidth, imgHeight, boxWidth, boxHeight ) => {
  let scale = Math.min( boxWidth / imgWidth, boxHeight / imgHeight );
  let width = imgWidth * scale;
  let height = imgHeight * scale;
  let x = ( boxWidth - width ) / 2;
  let y = ( boxHeight - height ) / 2;

  return { width, height, x, y };
};

export const fitCover = ( imgWidth, imgHeight, boxWidth, boxHeight ) => {
  let scale = Math.max( boxWidth / imgWidth, boxHeight / imgHeight );
  let width = imgWidth * scale;
  let height = imgHeight * scale;
  let x = ( width - boxWidth ) / -2;
  let y = ( height - boxHeight ) / -2;

  return { width, height, x, y };
};
