import {convertToVec2, vec2} from './threejs-tools';

export let setSvgPos = ( target, ...positions ) => {
	let { x, y, cx, cy, x1, y1, x2, y2 } = target;

	positions = positions.map( vec => convertToVec2( vec ) );

	if ( x && y ) {
		x.baseVal.value = positions[ 0 ].x;
		y.baseVal.value = positions[ 0 ].y;
	} else if ( cx && cy ) {
		cx.baseVal.value = positions[ 0 ].x;
		cy.baseVal.value = positions[ 0 ].y;
	} else if ( x1 && y1 && x2 && y2 ) {
		x1.baseVal.value = positions[ 0 ].x;
		y1.baseVal.value = positions[ 0 ].y;
		x2.baseVal.value = positions[ 1 ].x;
		y2.baseVal.value = positions[ 1 ].y;
	}
};

export let getSvgPos = ( target ) => {
	let { x, y, cx, cy, x1, y1, x2, y2 } = target;

	if ( x && y ) {
		return vec2( x.baseVal.value, y.baseVal.value );
	} else if ( cx && cy ) {
		return vec2( cx.baseVal.value, cy.baseVal.value );
	} else if ( x1 && y1 && x2 && y2 ) {
		return [
			vec2( x1.baseVal.value, y1.baseVal.value ),
			vec2( x2.baseVal.value, y2.baseVal.value ),
		];
	}
};