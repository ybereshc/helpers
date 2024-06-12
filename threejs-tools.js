import {isArray, isObject} from './type';
import {Vector3, Vector2, Matrix3} from 'three';

const convertToVec = ( dest, data, offset ) => {
	const p = ( k, i ) => isArray( data ) ? data[ offset + i ] : isObject( data ) ? data[ k ] : data;
	return dest.set( p( 'x', 0 ), p( 'y', 1 ), dest.isVector3 && p( 'z', 2 ) );
};

export const vec2 = ( x = -0, y = -0 ) => new Vector2( x, y );
export const vec3 = ( x = -0, y = -0, z = -0 ) => new Vector3( x, y, z );

export const convertToVec2 = ( data = -0, offset = 0 ) => convertToVec( vec2(), data, offset );
export const convertToVec3 = ( data = -0, offset = 0 ) => convertToVec( vec3(), data, offset );
