import md from 'md';
// import {poolLoader} from '../index';

export const parseCustomMarkdown = ( str ) => {
	var types = {
		'iframe': { width: '560px', frameborder: 0 },
		'img': {},
		'video': { width: '560px', controls: true, muted: true },
		'audio': { controls: true },
	};

	return str.replace( /!(\w+?)\(([^\n]*?)\)\[(.*?)\](\s*)/g, ( all, type, url, attrs, spaces ) => {
		type = type === 'image' ? 'img' : type;

		if ( types.hasOwnProperty( type ) ) {
			attrs = attrs.replace( /=(\w+)\s*/g, ( all, value ) => `="${ value }" ` );

			var doc = new DOMParser().parseFromString( `<node ${ attrs }/>`, 'application/xml' );

			attrs = Array.from( doc.documentElement.attributes ).reduce( ( obj, attr ) => ( obj[ attr.name ] = attr.value, obj ), {} );

			if ( type === 'img' || type === 'video' ) {
				// url = poolLoader.getUrl( url );
			}

			attrs = { ...types[ type ], ...attrs, src: url };

			attrs = Object.keys( attrs ).map( ( key ) => `${ key }="${ attrs[ key ] }"` ).join( ' ' );

			return `<p data-last="${ ( spaces.match( /\n/g )?.length || Infinity ) > 1 ? 'true' : 'false' }"><${ type } ${ attrs }></${ type }></p>${ spaces }`;
		}

		return all;
	} );
};

export const parseMarkdown = ( str ) => {
	// return parseCustomMarkdown( str );
	return md( parseCustomMarkdown( str ) );
};
