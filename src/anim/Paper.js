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
import { Line } from '@react-three/drei';

// React Spring - animation
import { a, useSpring } from '@react-spring/three';
// import { a, useTransition, Transition } from '@react-spring/three';

export const Paper = props => {
	const { position, scale, initStep, fold, foldKey } = props;

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

	const cleanFoldFile = foldObj => {
		const maxes = ([0, 2]).map(i => foldObj.vertices_coords.reduce(
			(max, coords) => Math.abs(coords[i]) > max ? Math.abs(coords[i]) : max,
			0	
		));

		foldObj.vertices_coords = foldObj.vertices_coords.map(coords =>
			new THREE.Vector3(coords[0] / maxes[0], 0, coords[1] / maxes[1])
		);
		console.log("[cleanFoldFile]", {maxes, foldObj});
	};

	const initGeometry = () => {
        // let geometry = new THREE.BufferGeometry();
        // geometry.verticesNeedUpdate = true;
        // geometry.dynamic = true;

        // lines.current.forEach(line => {
        //     var lineGeometry = line.geometry;
        //     if (lineGeometry) {
        //         line.geometry = null;
        //         lineGeometry.dispose();
        //     }

        //     line.geometry = new THREE.BufferGeometry();
        //     lineGeometry.dynamic = true;
        // });

        if (!fold) {
        	return;
        }


        let foldObj = JSON.parse(JSON.stringify(fold));
        cleanFoldFile(foldObj);

    	lines.current = fold.edges_vertices.map((vertexIndices, edgeIndex) => {
    	});

        // return geometry;
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

	useMemo(initGeometry, [foldKey]);
	const material = useMemo(createMaterial, []);

	console.log("[Paper.js]", lines.current)
	return (
		<group>
		    {fold && fold.edges_vertices.map(line => (
			    <Line
			    	points={line.map(index => fold.vertices_coords[index])}
					color="black"                   // Default
					lineWidth={1}                   // In pixels (default)
					dashed={false}                  // Default
			    />
		    ))}
	    </group>
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