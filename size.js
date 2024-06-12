export const resizeToPixelLimit = ( width, height, pixelLimit ) => {
	let ratio = width / height;
	let newHeight = Math.sqrt(pixelLimit / ratio);
	let newWidth = ratio * newHeight;

	return [ newWidth, newHeight ];
};

export const resizeToContain = ( width, height, maxWidth, maxHeight = maxWidth ) => {
	let ratio = width / height;

	if ( ratio > maxWidth / maxHeight ) {
		maxHeight = maxWidth / ratio;
	} else {
		maxWidth = maxHeight * ratio;
	}

	return [ maxWidth, maxHeight ];
};

export const resizeToCover = ( width, height, maxWidth, maxHeight = maxWidth ) => {
	let ratio = width / height;

	if ( ratio < maxWidth / maxHeight ) {
		maxHeight = maxWidth / ratio;
	} else {
		maxWidth = maxHeight * ratio;
	}

	return [ maxWidth, maxHeight ];
};

export const resizeMinMax = ( width, height, min, max ) => {
	if ( width < min || height < min ) {
		return resizeToCover( width, height, min, min );
	} else if ( width > max || height > max ) {
		return resizeToContain( width, height, max, max );
	}

	return [ width, height ];
};
