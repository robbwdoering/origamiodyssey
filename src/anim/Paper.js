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

import useStyles from './../style/theme';

export const Paper = props => {
	const {
		position,
		scale,
		ctrlOverlay,
		initStep,
		initFold,
		foldLastUpdated,
		foldKey,
		foldState,
		foldStateHash,
		setFoldState,
		editorState,
		editorStateHash
	} = props;

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
	const recursiveTriangulation = (curFace, foldObj) => {
		// If this is a triangle (or invalid...), just push it as is
		if (curFace.length <= 3) {
			foldObj.faces_vertices.push(curFace);
			// Else push a new triangle, and call this function again on the new shape
		} else {
			const [cutIdx] = curFace.splice(1, 1);
			foldObj.faces_vertices.push([curFace[0], cutIdx, curFace[1]]);
			foldObj.edges_vertices.push([curFace[0], curFace[1]]);
			recursiveTriangulation(curFace, foldObj);
		}
	};

	const setFoldObj = newFold => {
		let foldObj = JSON.parse(JSON.stringify(newFold));
		// Calculate the boundaries of the 2D shape
		const maxes = [0, 2].map(i =>
			foldObj.vertices_coords.reduce((max, coords) => (Math.abs(coords[i]) > max ? Math.abs(coords[i]) : max), 0)
		);

		// Re-scale the model to a unit square (1 unit x 1 unit)
		foldObj.vertices_coords = foldObj.vertices_coords.map(
			coords => new THREE.Vector3(coords[0] / maxes[0], 0, coords[2] / maxes[1])
		);

		foldObj.edges_foldAngle = foldObj.edges_vertices.map(() => 0);

		// TODO: Validate that all the angles in every face are acute

		// Triangulate all faces
		foldObj.faces_vertices = [];
		newFold.faces_vertices.forEach((face, faceIdx) => {
			let curFace = [...face];
			recursiveTriangulation(curFace, foldObj);
		});

		console.log('[setFoldObj]', { maxes, foldObj });
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

			// console.log("[calcStepsForLevel]", inst, targetLevel, curLevel);

			// Leaf nodes
			if (Array.isArray(inst)) {
				return curLevel >= targetLevel ? [inst] : [];

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
					if (curLevel === targetLevel - 1) {
						// If we're right before the target, return all children
						return inst.children.map(childInst => calcStepsForLevel(childInst, targetLevel, curLevel + 1));
					} else {
						// Else COLLECT children into one array
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
			console.log('returning empty', fold.current);
			return [];
		}

		// console.log("[collectStepsForLevel]", fold.instructions, foldState.selectedLevel)

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
			return 1;
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
	};

	const refreshFaceVertices = () => {
		if (!fold.current) {
			return;
		}

		// NOTE: 9 = 3 coords per vert * 3 vals per coord (such as x,y,z or r,g,b)
		let vertices = new Float32Array(9 * fold.current.faces_vertices.length);

		fold.current.faces_vertices.forEach((face, faceIdx) => {
			face.forEach((vertIdx, faceVertIdx) => {
				const coords = fold.current.vertices_coords[vertIdx];
				const startIdx = (faceIdx * 9) + (faceVertIdx * 3);

				// Copy over one vertex
				vertices[startIdx] = coords.x;
				vertices[startIdx + 1] = coords.y;
				vertices[startIdx + 2] = coords.z;
			});
		});

		faceGeometry.current.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
	}

	/*
	 * Initializes the fold state if possible, which involves reading the instructional hierarchy shape.
	 */
	const initFoldState = () => {
		console.log('[initFoldState]', initFold);
		if (!initFold) {
			return;
		}

		setFoldObj(initFold);

		// NOTE: 9 = 3 coords per vert * 3 vals per coord (such as x,y,z or r,g,b)
		faceGeometry.current = new THREE.BufferGeometry();
		let vertices = new Float32Array(9 * fold.current.faces_vertices.length);
		let normals = new Float32Array(9 * fold.current.faces_vertices.length);
		let colors = new Float32Array(9 * fold.current.faces_vertices.length);

		fold.current.faces_vertices.forEach((face, faceIdx) => {
			face.forEach((vertIdx, faceVertIdx) => {
				const coords = fold.current.vertices_coords[vertIdx];
				const startIdx = (faceIdx * 9) + (faceVertIdx * 3);

				// Copy over one vertex
				vertices[startIdx] = coords.x;
				vertices[startIdx + 1] = coords.y;
				vertices[startIdx + 2] = coords.z;

				normals[startIdx] = 0;
				normals[startIdx + 1] = -1;
				normals[startIdx + 2] = 0;

				colors[startIdx] = 300;
				colors[startIdx + 1] = 100;
				colors[startIdx + 2] = 100;
			});
		});

		console.log({ vertices, normals, colors });

		// OPTIONALL DEBUGS
		// for (let i = 0; i < vertices.length; i += 9) {
		// 	console.log(
		// 		`TRI: [(${vertices[i]}, ${vertices[i] + 2}), (${vertices[i + 3]}, ${vertices[i] + 5}), (${
		// 			vertices[i] + 6
		// 		}, ${vertices[i] + 8})]`
		// 	);
		// }

		faceGeometry.current.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		faceGeometry.current.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
		faceGeometry.current.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));

		if (fold.current.instructions) {
			setFoldState(readInstructionsIntoState(fold.current.instructions));
		}
	};

	const createMaterial = () => {
		return new THREE.MeshNormalMaterial({
			flatShading: true,
			// roughness: 1,
			attach: 'material',
			// color: '#ef626c',
			side: THREE.DoubleSide
		});
	};

	/**
	 * The ultimate goal of this function is to update vertex positions.
	 * IDEA: Handle one folding edge at a time, then propagate out following neighbors
	 */
	const performInstructions = () => {
		let curStep = foldState.stepIndex;
		if (curStep < -1 || curStep >= foldState.maxSteps) {
			curStep = -1;
		}
		const diff = curStep - prevStep;
		console.log('[performInstructions] ', `${prevStep} + ${diff} = ${curStep}`);

		if (diff > 0) {
			for (let i = 1; i <= diff; i++) {
				performCommands(fold.current, stepArray[prevStep + i], new Set(), );
			}
		} else {

		}

		refreshFaceVertices();

		setPrevStep(curStep);
	};

	const degToRad = degree => {
		return degree * Math.PI / 180;
	}
	/**
	 * Find the faces that include the given edge.
	 * Note that this was built specifically for purposes of rotation (i.e. folding),
	 * so it will use the isLhs parameter to decide which side of the edge to rotate
	 */
	const faceToFoldForEdge = (faces, edge, isLhs) => {
		return faces.findIndex((face, faceIdx) => {
			// If this face doesn't include the edge, ignore it
			if (!face.includes(edge[0]) || !face.includes(edge[1])) {
				return false;	
			}

			// Else check if this face is on the right side 
			// NOTE: this is using the initFold object, so it's looking at a flat version
			const start = initFold.vertices_coords[edge[0]];
			const end = initFold.vertices_coords[edge[1]];
			const third = initFold.vertices_coords[face.find(vert => !edge.includes(vert))];

			const d = (third[0] - start[0]) * (end[2] - start[2]) - (third[2] - start[2]) * (end[0] - start[0]);
			return isLhs ? d > 0 : d < 0;
		});
	};

	const rotateVertAroundEdge = (fold, vertIdx, edge, angle) => {
		// Read in the vectors of the three triangle points
		const start = fold.vertices_coords[edge[0]];
		const end = fold.vertices_coords[edge[1]];


		// Find the plane formed by the other side of this edge
		const otherFace = fold.faces_vertices.find(face => face.includes(edge[0]) && face.includes(edge[1]) && !face.includes(vertIdx));
		if (otherFace === null) {
			console.log("[rotateVertAroundEdge] ERR: Couldn't find other plane to base rotation in.");
			return;
		}
		const plane = new THREE.Plane();
		plane.setFromCoplanarPoints(...(otherFace.map(vertIdx => fold.vertices_coords[vertIdx])));

		const initStart = initFold.vertices_coords[edge[0]];
		const initThird = initFold.vertices_coords[vertIdx];
		const diffInPlane = new THREE.Vector3(initThird.x - initStart.x, initThird.y - initStart.x, initThird.z - initStart.z)

		// The third point starts off assuming no rotation
		const third = new THREE.Vector3(); 
		// const third = fold.vertices_coords[vertIdx];

		// Setup vectors for edge (start --> end), and the target (start --> third)
		const edgeDirection = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
	    edgeDirection.normalize();
	    const targetVec = new THREE.Vector3(third.x - start.x, third.y - start.x, third.z - start.z);

		console.log(`targetVec1: ${targetVec.x}, ${targetVec.y}, ${targetVec.z}`);
	    // Rotate the target vector around the edge
	   	targetVec.applyAxisAngle(edgeDirection, degToRad(angle));
		console.log(`targetVec2: ${targetVec.x}, ${targetVec.y}, ${targetVec.z}`);

	   	// Add the start back to the target, giving us the actual final location
	   	targetVec.add(start);
		console.log(`targetVec3: ${targetVec.x}, ${targetVec.y}, ${targetVec.z}`);

	    // Store the vertex coords for edges + vertices
	    fold.vertices_coords[vertIdx] = targetVec;
	    console.log("[rotateVertAroundEdge]", start, end, third, edgeDirection, targetVec)
	};

	/*
	 * Applies steps to fold the paper iteratively. The crux of this component - see Paper Engine design document.
	 * @param fold - the object to be modified
	 * @param steps - array of instructions
	 */
	const performCommands = (fold, cmds, vertsMoved = new Set(), edgesMoved = new Set(), level = 0) => {
		console.log("[performCommands] RUN: ", fold && fold.vertices_coords, cmds, level)
		if (!fold || cmds === undefined || level > 2) {
			return null;
		}

		let todoEdges = [];
		if (!Array.isArray(cmds)) {
			cmds = [ cmds ];
		}

		cmds.forEach((cmd, cmdIdx) => {
			// Parse the command - 0 & 1 are verts, 2 is foldAngle, and 3 is optional args
			const args = cmd.length === 4 ? cmd[3] : {};
			const edgeVerts = [cmd[0], cmd[1]];
			const edgeIdx = fold.edges_vertices.find(edge => edge.includes(cmd[0]) && edge.includes(cmd[1]));

			// Get the face that includes this edge on the right or left hand side, depending on the cmd args
			const faceIdx = faceToFoldForEdge(fold.faces_vertices, edgeVerts, args.lhs);

			// Find the index of the the third point in this triangle
			const thirdIdx = fold.faces_vertices[faceIdx].find(vertIdx => !edgeVerts.includes(vertIdx));

			// Stop if we should not move this edge, because it's at the end of the paper, or
			// we've already processed it during this step
			if (faceIdx === -1 || edgesMoved.has(edgeIdx) || vertsMoved.has(thirdIdx)) {
				return;
			}

			// Remember to not move this edge or vertex again
			edgesMoved.add(edgeIdx);
			vertsMoved.add(edgeVerts[0]);
			vertsMoved.add(edgeVerts[1]);
			vertsMoved.add(thirdIdx);

			// Rotate the third vertex around this edge 
			console.log(`Rotating ${thirdIdx} around (${edgeVerts[0]}, ${edgeVerts[1]} by ${cmd[2]})`)
			rotateVertAroundEdge(fold, thirdIdx, edgeVerts, cmd[2]);

			// Store the fold angle
			fold.edges_foldAngle[edgeIdx] = cmd[2];

			// Store the two other edges of the triangle
			const edgeIndices = fold.edges_vertices.reduce((acc, edge, idx) => {
				if (edge.includes(edgeVerts[0]) && edge.includes(thirdIdx)) {
					acc[0] = idx;
				} else if (edge.includes(edgeVerts[1]) && edge.includes(thirdIdx)) {
					acc[1] = idx;
				}
				return acc;
			}, [-1, -1]);

			// Get the angle to rotate these edges (last used, or default to 180)
			const foldAngleOne = edgeIndices[0] < fold.edges_foldAngle.length ? fold.edges_foldAngle[edgeIndices[0]] : 0;
			const foldAngleTwo = edgeIndices[1] < fold.edges_foldAngle.length ? fold.edges_foldAngle[edgeIndices[1]] : 0;

			const edges = [
				[edgeVerts[0], thirdIdx, foldAngleOne],
				[thirdIdx, edgeVerts[1], foldAngleTwo]
			];

			// Inspect both of the other edges - if they're novel, fold them as well
			// NOTE: the edge pointed to by the associated edgeIdx might be reversed
			// from what we're looking at; this is okay, since we're just using the indices
			// to ensure uniqueness here, we don't care about that value
			edgeIndices.forEach((edgeIdx, triIdx) => {
				if (!edgesMoved.has(edgeIdx) && !isEdgeOfPaper(edgeIdx)) {
					// Mark this edge to be moved next 
					todoEdges.push(edges[triIdx]);
				}
			});
		});

		// Do recursive call for every edge in the todo list
		performCommands(fold, todoEdges, vertsMoved, edgesMoved, level + 1);
	};

	/**
	 * Returns true if this vertex is on the very edge of the paper, false otherwise.
	 */
	const vertIsOnEdge = vertCoords => (
		Math.abs(vertCoords[0]) === 1 || Math.abs(vertCoords[2]) === 1
	);

	/**
	 * Returns true if this edge is on the very edge of the paper, false otherwise.
	 */
	const isEdgeOfPaper = (edgeIdx) => {
		// If this edge was created during triangulization, it can't be an edge
		if (!initFold || edgeIdx >= initFold.edges_vertices.length) {
			return false
		}

		// Find the coordinates of the vertices for this edge
		const edge = initFold.edges_vertices[edgeIdx];
		const coordsArr = edge.map(vertIdx => initFold.vertices_coords[vertIdx]);

		// If both vertices are on the edge, this edge is on the edge
		return vertIsOnEdge(coordsArr[0]) && vertIsOnEdge(coordsArr[1]);
	};

	const hoverVert = (idx, event, show) => {
		ctrlOverlay({
			show,
			name: 'vert_' + idx,
			component: (
				<Chip
					className={classes.vertLabel}
					style={{ left: event.pageX + 10, top: event.pageY - 64 + 10 }}
					label={initFold && `${idx}: ${initFold.vertices_coords[idx].toString()}`}
				/>
			)
		});
	};

	// ---------
	// LIFECYCLE
	// ---------
	useFrame(() => {
		// rotation.current = [0, rotation.current[1] + 1, 0];
	});

	const material = useMemo(createMaterial, []);
	const stepArray = useMemo(collectStepsForLevel, [
		!fold.current || !fold.current.instructions,
		foldKey,
		foldState.selectedLevel
	]);
	useEffect(performInstructions, [foldState.stepIndex]);
	useEffect(initFoldState, [foldKey, stepArray.length]);

	// console.log('[Paper]', { stepArray, fold: fold.current });

	if (!initFold) {
		return null;
	}

	return (
		<group>
			{editorState.showEdges &&
				fold.current &&
				fold.current.edges_vertices.map((line, idx) => 
					(idx >= initFold.edges_vertices.length && !editorState.showTriangulations) ? null : (
					<Line
						points={line.map(index => fold.current.vertices_coords[index])}
						color={(idx < initFold.edges_vertices.length) ? editorState.edgeHighlights.includes(idx) ? 'red' : 'black' : 'yellow'}
						lineWidth={1}
						dashed={idx >= initFold.edges_vertices.length}
						material={material}
						dashSize={0.1}
						gapSize={0.1}
					/>
				))}
			{editorState.showVertices &&
				fold.current &&
				fold.current.vertices_coords.map((vert, idx) => (
					<a.mesh
						position={vert}
						onPointerEnter={e => hoverVert(idx, e, true)}
						onPointerLeave={e => hoverVert(idx, e, false)}
					>
						<sphereBufferGeometry attach="geometry" args={[0.02, 8, 8]} />
						<meshStandardMaterial
							attach="material"
							roughness={0.5}
							color={editorState.vertexHighlights.includes(idx) ? 'red' : 'black'}
						/>
					</a.mesh>
				))}
			{editorState.showFaces && fold.current && faceGeometry.current && (
				<a.mesh
					geometry={faceGeometry.current}
					material={material}
					>
				</a.mesh>
			)}
		</group>
	);
};

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
