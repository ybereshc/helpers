/* debounce */
export const debounce = ( func, ms ) => {
	var timer = 0;

	return function( ...args ) {
		clearTimeout( timer );
		timer = setTimeout( () => func.apply( this, args ), ms );
	};
};

/* throttle */
export const throttle = ( func, ms ) => {
  var timer = 0;
	var context = null;

  return function wrapper( ...args ) {
    if ( timer ) {
			context = [ this, args ];
    } else {
			func.apply( this, args );

			timer = setTimeout( function() {
				timer = 0;

				if ( context ) {
					wrapper.apply( ...context );
					context = null;
				}
			}, ms );
		}
  };
};

/* memoize */
export const memoize = ( func ) => {
  var cache = {};

  return function( ...args ) {
    return cache[ JSON.stringify( args ) ] ||= func.apply( this, args );
  };
};

/* actual */
export const actual = () => {
  var id = 0;

  return () => {
    var currId = ++id;
    return () => currId === id;
  };
};
