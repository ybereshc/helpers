import {renderToString} from 'react-dom/server';

export function jsxToString( jsx ) {
	return renderToString( jsx );
}

export function htmlToElement( html, type ) {
	let localName = html.match( /<(\w+)/ )[ 1 ];

	if ( type === 'svg' ) {
		type = 'image/svg+xml';
	} else if ( type === 'xml' ) {
		type = 'text/xml';
	} else {
		type = 'text/html';
	}

	let element = new DOMParser().parseFromString( html, type ).getElementsByTagName( localName )[ 0 ];

	element.remove();

	return element;
}

export function jsxToElement( jsx, type ) {
	return htmlToElement( jsxToString( jsx ), type );
}
