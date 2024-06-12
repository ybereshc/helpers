import {isString} from './type';

let dateOptions = { locales: 'en-US', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };

export const parseDate = ( str ) => {
	if ( isString( str ) ) {
		if ( /[+\-]\d\d:\d\d$/.test( str ) ) {
			str = str.slice( 0, -6 );
		}

		str += '+00:00';
	} else {
		str = '';
	}

	return Date.parse( str );
};

export const parseDateToLocale = ( str, options = dateOptions ) => {
	return new Date( parseDate( str ) ).toLocaleString( options.locales, options );
};
