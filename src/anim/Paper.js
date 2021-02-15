/**
 * FILENAME: Paper.js 
 *
 * DESCRIPTION: Simulates a piece of paper. 
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader, extend } from 'react-three-fiber';
import * as THREE from 'three';
import { a, useTransition, Transition } from '@react-spring/three';

export const Paper = props => {
	const { position, scale } = props;

	// ----------
	// STATE INIT 
	// ----------
	const [instructions, setInstructions] = useState(null);
	const [foldState, setFoldState] = useState({
	});

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------

	// ---------
	// LIFECYCLE
	// ---------
	return (
	    <a.mesh position={position} scale={[scale, 0.05, scale]} >
	        <boxBufferGeometry attach="geometry" args={[0.2, 0.2, 0.2]} />
	        <meshBasicMaterial
		        roughness={0.5}
		        attach="material"
		        color='#ef626c'
                flatShading={true}
                side={THREE.FrontSide}
                // polygonOffset={ true}
                // polygonOffsetFactor={polygonOffset}
                // polygonOffsetUnits={1}
            />

            });
	    </a.mesh>
    );
}
