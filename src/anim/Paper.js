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
	const { position, scale, initStep, fold, foldKey, foldState, foldStateHash, setFoldState } = props;

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

	/*
	 * This walks the tree recursively, collecting an array of steps at this "level".
	 */
	const collectStepsForLevel = () => {
		const calcStepsForLevel = (inst, targetLevel, curLevel) => {
			if (!inst.length) {
				// Error case
				return null;
			}

			// Leaf nodes
			if (Array.isArray(inst)) {
				return curLevel >= targetLevel ? [ inst ] : [];

			// Ancestor nodes 
			} else {
				if (curLevel === targetLevel) {
					// Recursive case: Return 1 plus the height of the tallest subtree
					return inst.children.reduce((acc, childInst) => {
						let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
						if (ret) {
							acc.push(ret);
						}
						return acc;
					}, []);
				} else if (curLevel > targetLevel) {
					// Recursive case: past target level, so combine all children into one array
					return inst.children.reduce((acc, childInst) => {
						let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
						if (ret) {
							return acc.concat(ret);
						}
						return acc;
					}, []);
				} else if (curLevel < targetLevel) {
					// Recursive case: still above target level, so keep drilling down
					// If we're right before the target, return all children
					if (curLevel === targetLevel - 1) {
						return inst.children.map(childInst => calcStepsForLevel(childInst, targetLevel, curLevel + 1));
					// Else combine received arrays
					} else {
						return inst.children.reduce((acc, childInst) => {
							let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
							if (ret) {
								return acc.concat(ret);
							}
							return acc;
						}, []);
					}
				}
			}
		};

		if (!fold || !fold.sequential_folds) {
			console.log("returning empty", fold)
			return [];
		}

		return calcStepsForLevel(fold.sequential_folds, foldState.selectedLevel, 0);
	};

	// Nested recursive function to calculate the depth of the instruction tree
	const calcMaxLevel = inst => {
		if (!inst.length) {
			// Error case
			return 0;
		} else if (Array.isArray(inst[0])) {
			// Recursive case: Return 1 plus the height of the tallest subtree
			return 1 + Math.max(...inst.map(childInst => calcMaxLevel(childInst)));
		} else {
			// Base case: leaf node
			return 1
		}
	};


	/*
	 * Reads the hierarchical instructions, collecting some descriptive values and initializing state.
	 * This task is greatly simplified by mandating that any one node of the instructional tree
	 * contain EITHER two integer values, or 1+ subnodes. Any node with subnodes may not have integer values.
	 */
	const readInstructionsIntoState = inst => {

		return {
			maxLevel: calcMaxLevel(inst),
			selectedLevel: 0,
			stepIndex: 0,
			maxSteps: stepArray.length
		};
	}

	/*
	 * Initializes the fold state if possible, which involves reading the instructional hierarchy shape.
	 */
	const initFoldState = () => {
        if (!fold) {
        	return;
        }

        let foldObj = JSON.parse(JSON.stringify(fold));
        cleanFoldFile(foldObj);

        if (foldObj.sequential_folds) {
        	setFoldState(readInstructionsIntoState(foldObj.sequential_folds));
        }
	};

	const createMaterial = () => {
        return  new THREE.MeshNormalMaterial({
            flatShading: true,
	        roughness: 0.5,
	        attach: "material",
	        color: '#ef626c',
            side: THREE.DoubleSide
        });
	};

	// ---------
	// LIFECYCLE
	// ---------
	useFrame(() => {
		// rotation.current = [0, rotation.current[1] + 1, 0];
	});

	const material = useMemo(createMaterial, []);
	const stepArray = useMemo(collectStepsForLevel, [foldKey, foldState.selectedLevel]);
	useEffect(initFoldState, [foldKey]);

	console.log("[Paper]", { stepArray })

	return (
		<group>
		    {fold && fold.edges_vertices.map(line => (
			    <Line
			    	points={line.map(index => fold.vertices_coords[index])}
					color="black"                   // Default
					lineWidth={1}                   // In pixels (default)
					dashed={false}                  // Default
					material={material}
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