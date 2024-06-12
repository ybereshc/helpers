import {isArray, isBlob, isIterable, isNumber, isObject, isString} from './type';
import {getExtensionByType, getTypeByPath} from './_mimetype';
import {tryCatch} from './tryCatch';

export const isDev = window.location.hostname !== 'spin.show';
export const isIFrame = window !== window.parent;
export const isLocalIFrame = tryCatch( () => isIFrame && window.location.origin === window.parent.location.origin ) || false;

const canUseImageAsync = ( src ) => {
	return new Promise( resolve => {
    let img = new Image();
    img.onload = () => resolve( !!img.width );
    img.onerror = () => resolve( false );
		img.src = src;
	} );
};

export const supportAVIFPromise = canUseImageAsync( 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAPBtZXRhAAAAAAAAAChoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAbGliYXZpZgAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAEUAAAAFwAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABoaXBycAAAAElpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAOcGl4aQAAAAABCAAAAAxhdjFDgQAcAAAAABNjb2xybmNseAABAA0ABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKBxgABhgIaDUyChjANNEAAiEdyOA=' );
export const supportWEBPPromise = canUseImageAsync( 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==' );
// export const supportBMPPromise = canUseImageAsync( 'data:image/bmp;base64,Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAA==' );

export const bestImageTypesPromise = Promise.all( [
	supportAVIFPromise.then( v => v && 'avif' ),
	supportWEBPPromise.then( v => v && 'webp' ),
	'jpeg',
	'gif',
	'png',
	'bmp',
	// supportBMPPromise.then( v => v && 'bmp' ),
] ).then( t => t.filter( t => t ) );

let _isOnline = true;

export const isOnline = () => _isOnline;

window.addEventListener( 'offline', () => _isOnline = false );
window.addEventListener( 'online', () => _isOnline = true );

export const delay = ( ms, data ) => new Promise( response => setTimeout( () => response( data ), ms ) );

export const forEach = ( target, func ) => {
	let index = 0;

	if ( Array.isArray( target ) || target instanceof Set ) {
		for ( let val of target ) {
			func( val, index, index++, target );
		}
	} else if ( target instanceof Map ) {
		for ( let el of target ) {
			func( el[ 1 ], el[ 0 ], index++, target );
		}
	} else {
		for ( let key in target ) {
			func( target[ key ], key, index++, target );
		}
	}
};

export const mapTo = ( target, func, dest ) => {
	forEach( target, ( () => {
		if ( Array.isArray( dest ?? target ) ) {
			dest ??= [];

			return ( ...args ) => dest.push( func( ...args, dest ) );
		} else if ( ( dest ?? target ) instanceof Map ) {
			dest ??= new Map();

			return ( ...args ) => dest.set( ...func( ...args, dest ) );
		} else if ( ( dest ?? target ) instanceof Set ) {
			dest ??= new Set();

			return ( ...args ) => dest.add( func( ...args, dest ) );
		}

		dest ??= {};

		return ( ...args ) => {
			let [ key, val ] = func( ...args, dest );
			dest[ key ] = val;
		};
	} )() );

	return dest;
};

export const assignOnly = ( keys, target, ...objs ) => {
	keys.forEach( key => {
		objs.forEach( obj => {
			if ( obj.hasOwnProperty( key ) ) {
				target[ key ] = obj[ key ];
			}
		} );
	} );
};

export const areObjectsEqual = ( obj1, obj2 ) => {
	return JSON.stringify( obj1 ) === JSON.stringify( obj2 );

	if ( obj1 === obj2 ) {
	  return true;
	} else if ( isArray( obj1 ) === isArray( obj2 ) ) {
		let keys1 = obj1;
		let keys2 = obj2;

		if ( !isArray( obj1 ) ) {
			keys1 = Object.keys( obj1 );
			keys2 = Object.keys( obj2 );
		}

		if ( keys1.length === keys2.length && JSON.stringify( obj1 ) === JSON.stringify( obj2 ) ) {
			return true;
		}
	}

	return false;
};

export function getElementPath( target ) {
	let path = [];

	for ( let curr = target; curr; curr = curr.parentElement ) {
		path.push( curr );
	}

	return path;
}

export const genUniqStr = ( length = 8 ) => {
    let ary = Array( length );

    for ( let i = 0; i < length; i++ ) {
        ary[ i ] = Math.floor( Math.random() * 36 ).toString( 36 );
    }

    return ary.join( '' );
};

export const getWheelValue = ( { shiftKey, altKey, deltaY }, shift = 10, alt = 0.1 ) => {
	return ( deltaY < 0 ? 1 : -1 ) * ( shiftKey ? shift : altKey ? alt : 1 );
};

export function getClosestElement( target, func ) {
	for ( let curr = target; curr; curr = curr.parentElement ) {
		if ( func( curr ) ) {
			return curr;
		}
	}
}

export const convertToSI = ( num, fraction = 2 ) => {
	if ( num >= 1000 || num <= -1000 ) {
		let i = Math.floor( Math.log( num ) / Math.log( 1000 ) );
		return `${ ( num / Math.pow( 1000, i ) ).toFixed( fraction ) }${ 'KMGTPEZYRQ'.at( i - 1 )  }`;
	} else if ( num && num < 1 && num > -1 ) {
		let i = Math.floor( Math.log( num ) / Math.log( 0.001 ) );
		return `${ ( num *  Math.pow( 1000, i + 1) ).toFixed( fraction ) }${ 'mµnpfazyrq'.at( i )  }`;
	}

	return num.toFixed( fraction );
};

export const convertBytesToSI = ( bytes, fraction = 2 ) => {
	let sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'RB', 'QB' ];

	if ( bytes === 0 ) {
		return '0 Byte';
	}

	let i = Math.floor( Math.log( bytes ) / Math.log( 1024 ) );
	return `${ ( bytes / Math.pow( 1024, i ) ).toFixed( fraction ) } ${ sizes[ i ] }`;
};

export const parseUrl = ( url ) => {
	var match = url.match( /^(?:(\w+:)\/\/)?([\w-]+(?:\.\w+)*)?(?::(\d+))?([^?]*)?(\?[^#]*)?(#.*)?/ );

	if ( url && match ) {
		var [ , protocol = '', hostname = '', port = '', pathname = '/', search = '', fragment = '' ] = match;
		var host = `${ hostname }${ port && ':' }${ port }`;
		var origin = `${ protocol }${ protocol && '//' }${ host }`;
		var path = `${ pathname }${ search }${ fragment }`;
		var href = `${ origin }${ path }`;

		return { protocol, hostname, port, pathname, search, fragment, path, host, origin, href };
	}

	return null;
};

export const fixUrl = ( url ) => {
	var { host, href, protocol } = parseUrl( url ) || {};
	return ( url && host && !protocol ) ? `//${ href }` : href;
};

export const openLink = ( url, target ) => {
	var anchor = document.createElement( 'a' );
	anchor.setAttribute( 'href', fixUrl( url ) );
	target && anchor.setAttribute( 'target', target );
	anchor.click();
};

export const embedUrl = ( url ) => {
	var { pathname, hostname, search } = parseUrl( url );

	if ( /youtu\.be$/i.test( hostname ) || /(\w+\.)?youtube(-nocookie)?\./i.test( hostname ) ) {
		if ( /^\/embed\/videoseries/.test( pathname ) || /^\/playlist/.test( pathname ) ) {
			var playlist = new URLSearchParams( search ).get( 'list' );
		} else if ( /^\/embed/.test( pathname ) ) {
			var [ , watch ] = pathname.match( /^\/embed\/(.*)/ );
		} else if ( /^\/watch/.test( pathname ) ) {
			var watch = new URLSearchParams( search ).get( 'v' );
		} else if ( /youtu\.be$/i.test( hostname ) ) {
			var watch = pathname.slice( 1 );
		}

		if ( watch || playlist ) {
			return `https://www.youtube.com/embed/${ watch ? watch : `videoseries?list=${ playlist }` }`;
		}
	} else if ( /(player\.)?vimeo\.com/i.test( hostname ) ) {
		if ( /^(\/video)?\/\d+/.test( pathname ) ) {
			return `https://player.vimeo.com/video/${ pathname.split( '/' ).at( -1 ) }`;
		}
	}

	return '';
};

export const resolvify = async ( data ) => {
	let res = data = await data;

	if ( isArray( data ) ) {
		res = Array( data.length );

		for ( let i = 0; i < data.length; i++ ) {
			res[ i ] = await resolvify( data[ i ] );
		}
	} else if ( isObject( data ) && data.__proto__ === Object.prototype ) {
		res = {};

		for ( let k in data ) {
			res[ k ] = await resolvify( data[ k ] );
		}
	}

	return res;
};

export const deepAssign = ( target, ...sources ) => {
  sources.forEach(source => {
    Object.keys( source ).forEach( key => {
      if ( source[ key ] && typeof source[ key ] === 'object' && !Array.isArray( source[ key ] ) ) {
        if ( !target[ key ] || typeof target[ key ] !== 'object' || Array.isArray( target[ key ] ) ) {
          target[ key ] = {};
        }

        deepAssign( target[ key ], source[ key ] );
      } else {
        target[ key ] = source[ key ];
      }
    } );
  } );

  return target;
};

export const fillArray = ( length, func ) => {
  let res = Array( length );

  if ( typeof func === 'function' ) {
    for ( let i = 0; i < length; i++ ) {
      res[ i ] = func( i );
    }
  } else {
    res.fill( func );
  }

  return res;
};

export const zeroFill = ( num, maxLength ) => num.toString().padStart( maxLength, '0' );

export const secToTime = ( sec ) => {
	let secNum = sec | 0;
	let hours   = secNum / 3600 | 0;
	let minutes = ( secNum - ( hours * 3600 ) ) / 60 | 0;
	let seconds = secNum - ( hours * 3600 ) - ( minutes * 60 );

	return [ hours, minutes, seconds ].map( n => zeroFill( n, 2 ) ).join( ':' );
};

export const concat = ( ...args ) => args.filter( arg => typeof arg === 'string' && arg.length ).join( ' ' );

export const recursiveMap = ( target, callback ) => {
	Object.keys( target ).forEach( key => {
		if ( typeof target[ key ] === 'object' ) {
			recursiveMap( target[ key ], callback );
		} else {
			target[ key ] = callback( target[ key ], key );
		}
	} );

	return target;
};

export const stopPropagation = ( ev ) => ev.stopPropagation();
export const preventDefault = ( ev ) => ev.preventDefault();

export const objectToArray = ( data ) => Object.keys( data ).map( key => ( { key, val: data[ key ] } ) );

const _getFileName = ( url ) => tryCatch( () => url.split( '?' )[ 0 ].split( '/' ).at( -1 ) ) || '';

export const downloadFile = async ( source, fileName ) => {
	let [ base, ext ] = _getFileName( fileName ).split( '.' );

	let blob = await ( isBlob( source ) ? source : fetch( source ).then( res => res.blob() ) );

	base ||= tryCatch( () => _getFileName( isString( source ) && !source.match( '^blob:' ) ? source : source.name ).split( '.' )[ 0 ] );

	let href = URL.createObjectURL( blob );

  let link = document.createElement( 'a' );
  link.target = '_blank';
  link.download = `${ base }.${ ext || getExtensionByType( blob.type ) || 'bin' }`;
	link.href = href;
	link.click();

	URL.revokeObjectURL( href );
};

export const downloadImage = async ( source, fileName, type, quality ) => {
	source = await source;

	let _fileName = fileName ?? source.name ?? 'image.jpg';
	let _type = type ?? 'image/jpeg';
	let _quality = quality ?? undefined;

  let link = document.createElement( 'a' );
  link.target = '_blank';
  link.download = _fileName;

	const reDraw = async () => {
		if ( source instanceof Blob ) {
			source = await new Promise( resolve => {
				let img = document.createElement( 'img' );
				img.onload = () => resolve( img );
				img.src = URL.createObjectURL( source );
			} );
		}

		let canvas = document.createElement( 'canvas' );
		canvas.width = source.width;
		canvas.height = source.height;
		canvas.getContext( '2d' ).drawImage( source, 0, 0 );

		link.href = canvas.toDataURL( _type, _quality );
	};

	if ( isString( type ) || isNumber( quality ) ) {
		await reDraw();
	} else if ( source.localName === 'canvas' ) {
		link.href = source.toDataURL( _type, _quality );
	} else if ( source.localName === 'img' ) {
		link.href = source.src;
	} else if ( source instanceof Blob ) {
		link.href = URL.createObjectURL( source );
	} else {
		await reDraw();
	}

  link.click();
}

export const filterImageBlobs = ( files, types ) => {
	types = new Set( isIterable( types ) ? [ ...types ].map( type => 'image/' + type ) : [] );
	types = types.size ? types : /image\//;

	return [ ...files ].filter( file => {
		let type = file.type || getTypeByPath( file.name );
		return types.size ? types.has( type ) : types.test( type );
	} );
};

export const createElement = ( tag, attrs, props, children ) => {
	let [ tagName, namespace ] = tag.split( ':', 2 );

	let el = ( () => {
		if ( namespace === 'svg' ) {
			return document.createElementNS( 'http://www.w3.org/2000/svg', tagName );
		} else {
			return document.createElement( tagName || 'div' );
		}
	} )();

	attrs && Object.keys( attrs ).forEach( key => el.setAttribute( key, attrs[ key ] ) );
	props && Object.keys( props ).forEach( key => el[ key ] = props[ key ] );
	children && el.append( ...children );

	return el;
};

export const importFiles = async ( accept, multiple ) => {
	return new Promise( resolve => {
		let input = document.createElement( 'input' );
		input.setAttribute( 'type', 'file' );
		accept && input.setAttribute( 'accept', accept );
		multiple && input.setAttribute( 'multiple', '' );
		input.onchange = ( ev ) => resolve( ev.target.files );
		input.click();
	} );
}

export function selectText( element ) {
	if ( document.body.createTextRange ) {
		let range = document.body.createTextRange();
		range.moveToElementText( element );
		range.select();
	} else if ( window.getSelection ) {
		let selection = window.getSelection();
		let range = document.createRange();
		range.selectNodeContents( element );
		selection.removeAllRanges();
		selection.addRange( range );
	} else {
		console.error( 'Could not select text in node: Unsupported browser.' );
	}
}

export const upperCaseFirst = ( str ) => str.at( 0 ).toLocaleUpperCase() + str.slice( 1 );
