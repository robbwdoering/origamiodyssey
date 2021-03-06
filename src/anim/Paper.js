/**
 * FILENAME: Paper.js 
 *
 * DESCRIPTION: Simulates a piece of paper. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';

// Threejs - 3D Animation
import { Canvas, useFrame, useThree, useLoader, extend } from 'react-three-fiber';
import * as THREE from 'three';

// React Spring - animation
import { a, useSpring } from '@react-spring/three';
// import { a, useTransition, Transition } from '@react-spring/three';

export const Paper = props => {
	const { position, scale, initStep, fold, foldHash } = props;

	// ----------
	// STATE INIT 
	// ----------
	const [instructions, setInstructions] = useState(null);
	const [step, setStep] = useState(initStep);

	const rotation = useRef([0, 0, 0]);
	const vertices = useRef([]) 
	const lines = useRef([]);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------

	const createGeometry = () => {
        let geometry = new THREE.BufferGeometry();
        // geometry.verticesNeedUpdate = true;
        geometry.dynamic = true;

        lines.current.forEach(line => {
            var lineGeometry = line.geometry;
            if (lineGeometry) {
                line.geometry = null;
                lineGeometry.dispose();
            }

            line.geometry = new THREE.BufferGeometry();
            lineGeometry.dynamic = true;
        });

        if (fold) {
        	
        }

        return geometry;
	};

	const createMaterial = () => {
        return  new THREE.MeshNormalMaterial({
            flatShading: true,
	        roughness: 0.5,
	        attach: "material",
	        color: '#ef626c',
            side: THREE.DoubleSide,
            // polygonOffset: true,
            // polygonOffsetFactor: 0, // positive value pushes polygon further away
            // polygonOffsetUnits: 1
        });
	}

	// ---------
	// LIFECYCLE
	// ---------
	useFrame(() => {
		// rotation.current = [0, rotation.current[1] + 1, 0];
	});

	const geometry = useMemo(createGeometry, []);
	const material = useMemo(createMaterial, []);

	return (
	    <a.mesh
		    position={position}
		    scale={[scale, 0.02, scale]}
		    rotation={rotation.current}
	    	geometry={geometry}
	    	material={material}
	    >
	    </a.mesh>
    );
}

/*
FOLDING ENGINE
1. Description
	The function of this "engine", which basically means a stateful algo here, is to manipulate three.js objects.
	Thus, the output of all of this are the props used in the return statement of the <Paper/> component.
	The initial input is the initFold object, which is a FOLD json object with special step components.
	An index into the step array is maintained, and any transitions result in 
2. Function Structure
	1.1. stepTo

*/