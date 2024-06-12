export const imageCopy = async ( src, width = src.width, height = src.height ) => {
	let canvas = Object.assign( document.createElement( 'canvas' ), { width, height } );
	canvas.getContext( '2d' ).drawImage( src, 0, 0, width, height );
	return canvas;
};

export const imageContain = async ( src, width, height = width ) => {
  let { width: w, height: h } = src;
  let aspect = w / h;

  if ( h > height ) {
    w = ( h = height ) * aspect;
  }

	if ( w > width ) {
    h = ( w = width ) / aspect;
  }

  return await imageCopy( src, w, h );
};
