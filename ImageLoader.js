import {LoaderUtils} from 'three';
import {isString, isUndefined} from './type';

export class ImageLoader {
	constructor( options = {} ) {
		this._cache = {};

		this.path = options.hasOwnProperty( 'path' ) ? options.path : '';
		this.crossOrigin = options.hasOwnProperty( 'crossOrigin' ) ? options.crossOrigin : 'anonymous';
	}

	getUrl( url ) {
		if ( this.path ) {
			return LoaderUtils.resolveURL( url, this.path );
		} else {
			return url;
		}
	}

	removeFromCache( src ) {
		if ( isString( src ) ) {
			src = this.getUrl( src );
			let img = this._cache[ src ];
			delete this._cache[ src ];
			return img;
		} else {
			Object.keys( this._cache ).forEach( url => {
				if ( this._cache[ url ] === src ) {
					this.removeFromCache( url );
				}
			} );
		}
	}

	load( url, force = false ) {
		return this.loadAsync( url, force ).image;
	}

	loadAsync( url, force = false ) {
		url = this.getUrl( url );

		if ( !force && this._cache[ url ] ) {
			return Promise.resolve( this._cache[ url ] );
		}

		let image = null;

		let promise = this._cache[ url ] = new Promise( ( resolve, reject ) => {
			image = new Image();

			const onLoad = () => {
				removeEventListeners();
				resolve( this._cache[ url ] = image );
			};

			const onError = ( event ) => {
				removeEventListeners();
				reject( event );
			};

			const removeEventListeners = () => {
				image.removeEventListener( 'load', onLoad, false );
				image.removeEventListener( 'error', onError, false );
			};

			image.addEventListener( 'load', onLoad, false );
			image.addEventListener( 'error', onError, false );

			if ( !isUndefined( this.crossOrigin ) && !/^data:/.test( url ) ) {
				image.crossOrigin = this.crossOrigin;
			}

			image.src = url;
		} );

		return Object.defineProperty( promise, 'image', { value: image } );
	}
}
