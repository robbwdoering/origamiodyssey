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
	const { position, scale, initStep, initFold, foldKey, foldState, foldStateHash, setFoldState } = props;

	// ----------
	// STATE INIT 
	// ----------
	const [instructions, setInstructions] = useState(null);
	const [prevStep, setPrevStep] = useState(initStep);

	const rotation = useRef([0, 0, 0]);
	const vertices = useRef([]) 
	const lines = useRef([]);
	const edgeRotations = useRef([]);
	const fold = useRef(null);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------

	const setFoldObj = newFold => {
		let foldObj = JSON.parse(JSON.stringify(newFold))
		// Calculate the boundaries of the 2D shape
		const maxes = ([0, 2]).map(i => foldObj.vertices_coords.reduce(
			(max, coords) => Math.abs(coords[i]) > max ? Math.abs(coords[i]) : max,
			0	
		));

		// Re-scale the model to a unit square (1 unit x 1 unit)
		foldObj.vertices_coords = foldObj.vertices_coords.map(coords =>
			new THREE.Vector3(coords[0] / maxes[0], 0, coords[2] / maxes[1])
		);

		foldObj.edges_foldAngle = foldObj.edges_vertices.map(() => 180);

		console.log("[setFoldObj]", { maxes, foldObj });
		fold.current = foldObj;
	};

	/*
	 * This walks the tree recursively, collecting an array of steps at this "level".
	 */
	const collectStepsForLevel = () => {
		const calcStepsForLevel = (inst, targetLevel, curLevel) => {
			if (!inst.children && !inst.length) {
				// Error case
				return null;
			}

			console.log("[calcStepsForLevel]", inst, targetLevel, curLevel);

			// Leaf nodes
			if (Array.isArray(inst)) {
				return curLevel >= targetLevel ? [ inst ] : [];

			// Ancestor nodes 
			} else {
				if (curLevel === targetLevel) {
					// Recursive case: This is target, so COMBINE children to one array
					return inst.children.reduce((acc, childInst) => {
						let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
						if (ret) {
							acc.push(ret);
						}
						return acc;
					}, []);
				} else if (curLevel > targetLevel) {
					// Recursive case: past target level, so COLLECT children into one array
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
					// Else COLLECT children into one array
					} else {
						return inst.children.reduce((acc, childInst) => {
							let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
							if (ret) {
								return acc.push(ret);
							}
							return acc;
						}, []);
					}
				}
			}
		};

		if (!fold.current || !fold.current.instructions) {
			console.log("returning empty", fold)
			return [];
		}

		console.log("[collectStepsForLevel]", fold.instructions, foldState.selectedLevel)

		return calcStepsForLevel(fold.current.instructions, foldState.selectedLevel, 0);
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
			stepIndex: -1,
			maxSteps: stepArray.length
		};
	}

	/*
	 * Initializes the fold state if possible, which involves reading the instructional hierarchy shape.
	 */
	const initFoldState = () => {
        // console.log("[initFoldState]", initFold);
        if (!initFold) {
        	return;
        }

		setFoldObj(initFold);

        if (fold.current.instructions) {
        	setFoldState(readInstructionsIntoState(fold.current.instructions));
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

	/**
	 * The ultimate goal of this function is to update vertex positions.
	 * IDEA: Handle one folding edge at a time, then propagate out following neighbors
	 */
	const performInstructionStep = () => {
		let curStep = foldState.stepIndex;
		if (curStep < -1 || curStep >= foldState.maxSteps) {
			curStep = -1;
		}

		console.log("[performInstructionStep] ", curStep);

		// The Init step - all fold angles 0
		// if (step === -1) {
		// 	setFoldObj(initFold);
		// }

		setPrevStep(curStep);	
	}


	/* 
	 * Applies steps to fold the paper iteratively. The crux of this component - see Paper Engine design document.
	 * @param fold - the object to be modified 
	 * @param steps - array of instructions 
	 */
	const applySteps = (fold, steps) => {
		if (!fold || !steps) {
			return null;
		}

		steps.forEach(step => {
			// Step is array, with format [edge, rotation, type (optional, default to RH)]

			// Get all faces for this edge
			// Rotate all other vertices part of adjacent faces around this edge 
			// Add to array of edges to do in next call 
		});

		// Do recursive call
	}

	// ---------
	// LIFECYCLE
	// ---------
	useFrame(() => {
		// rotation.current = [0, rotation.current[1] + 1, 0];
	});

	const material = useMemo(createMaterial, []);
	const stepArray = useMemo(collectStepsForLevel, [foldKey, foldState.selectedLevel]);
	useEffect(performInstructionStep, [foldState.stepIndex]);
	useEffect(initFoldState, [foldKey]);

	console.log("[Paper]", { stepArray, fold: fold.current })

	return (
		<group>
		    {fold.current && fold.current.edges_vertices.map(line => (
			    <Line
			    	points={line.map(index => fold.current.vertices_coords[index])}
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