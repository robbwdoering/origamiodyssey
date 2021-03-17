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
import { Chip } from '@material-ui/core';

import useStyles from "./../style/theme";

export const Paper = props => {
	const { position, scale, ctrlOverlay, initStep, initFold, foldKey, foldState, foldStateHash, setFoldState, editorState, editorStateHash } = props;

	// ----------
	// STATE INIT 
	// ----------
	const [instructions, setInstructions] = useState(null);
	const [prevStep, setPrevStep] = useState(initStep);

	const rotation = useRef([0, 0, 0]);
	const faceGeometry = useRef(null);
	const edgeRotations = useRef([]);
	const fold = useRef(null);
	const classes = useStyles();

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
			console.log("returning empty", fold.current)
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
        console.log("[initFoldState]", initFold);
        if (!initFold) {
        	return;
        }

		setFoldObj(initFold);

		faceGeometry.current = initFold.faces_vertices.map((face, faceIdx) => {
			let geometry = new THREE.BufferGeometry();
			let vertices = face.reduce((spread, vertIdx) => spread.concat(initFold.vertices_coords[vertIdx]), []);
			let normals = vertices.map((e, idx) => idx % 3 === 1 ? 1 : 0);

			geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
			geometry.setAttribute('normal', new THREE.Float32BufferAttribute( normals, 3 ));
			return geometry;
		});

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

	const findFacesForEdge = (faces, edge, isLhs) => {
		return faces.reduce((acc, face, faceIdx) => {
			const edgeInFace = face.some((vertIdx, faceVertIdx) => {
				// If this vertex isn't in the edge, then we can ignore it
				if (!edge[isLhs ? 1 : 0] === vertIdx) {
					return false;

				// If the first, compare with the last in the array (loops)
				} else if (faceVertIdx === 0) {
					return edge[isLhs ? 0 : 1] === face[face.length - 1];

				// Else, compare with the previous
				} else {
					return edge[isLhs ? 0 : 1] === face[faceVertIdx - 1];
				}
			});

			if (edgeInFace) {
				acc.push(faceIdx);
			}
			return acc;
		}, []);
	};

	const rotateVertAroundEdge = (fold, vertIdx, edge) => {
		console.log("[rotateVertAroundEdge]", {fold, vertIdx, edge});
	};

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
			// Step is an array in the format:
			// [ edge (int or str of format "[0-9]+[R]*"),
			// rotation (angle in degrees),
			// args (optional object) ]

			// Get all faces for this edge
			const faceList = findFacesForEdge(fold.faces_vertices, step[0]);

			// Rotate all other vertices part of adjacent faces around this edge 
			faceList.forEach(faceIdx => {
				// Get all vertices not part of this edge
				fold.faces_vertices[faceIdx]
					.filter(vertIdx => !step[0].includes(vertIdx))
					.forEach(vertIdx => rotateVertAroundEdge(fold, vertIdx, step[0]))

				// Rotate them

			});
			// Add to array of edges to do in next call 
		});

		// Do recursive call
	}

	const hoverVert = (idx, event, show) => {
		ctrlOverlay({
			show,
			name: "vert_"+idx,  
			component: (
				<Chip
					className={classes.vertLabel}
					style={{left: event.pageX + 10, top: event.pageY - 64 + 10}}
					label={initFold && `${idx}: ${initFold.vertices_coords[idx].toString()}`}
				/>
			)
		})	
	}

	// ---------
	// LIFECYCLE
	// ---------
	useFrame(() => {
		// rotation.current = [0, rotation.current[1] + 1, 0];
	});

	const material = useMemo(createMaterial, []);
	const stepArray = useMemo(collectStepsForLevel, [!fold.current || !fold.current.instructions, foldKey, foldState.selectedLevel]);
	useEffect(performInstructionStep, [foldState.stepIndex]);
	useEffect(initFoldState, [foldKey, stepArray.length]);

	console.log("[Paper]", { stepArray, fold: fold.current })

	return (
		<group>
		    {editorState.showEdges && fold.current && fold.current.edges_vertices.map((line, idx) => (
			    <Line
			    	points={line.map(index => fold.current.vertices_coords[index])}
					color={editorState.edgeHighlights.includes(idx) ? "red" : "black"}
					lineWidth={1}
					dashed={false}
					material={material}
			    />
		    ))}
		    {editorState.showVertices && fold.current && fold.current.vertices_coords.map((vert, idx) => (
		    	<a.mesh
		    		position={vert}
		    		onPointerEnter={e => hoverVert(idx, e, true)}
		    		onPointerLeave={e => hoverVert(idx, e, false)}
				>
					<sphereBufferGeometry attach="geometry" args={[0.02, 8, 8]} />
					<meshStandardMaterial attach="material" roughness={0.5} color={editorState.edgeHighlights.includes(idx) ? "red" : "black"} />
		    	</a.mesh>	
		    ))}
		    {editorState.showFaces && fold.current && faceGeometry.current && faceGeometry.current.map(geometry => (
		    	<a.mesh
		    		geometry={geometry}
		    		material={material}
				>
		    	</a.mesh>	
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