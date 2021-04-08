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
import { collectStepsForLevel, calcMaxLevel, stepIs3D } from './../infra/utils';

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
	const creasedEdges = useRef(new Set());
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

		foldObj.edges_foldAngle = foldObj.edges_vertices.map(() => 180);

		// TODO: Validate that all the angles in every face are acute

		// Triangulate all faces
		foldObj.faces_vertices = [];
		newFold.faces_vertices.forEach((face, faceIdx) => {
			let curFace = [...face];
			recursiveTriangulation(curFace, foldObj);
		});

		foldObj.faces_normals = foldObj.faces_vertices.map(face => new THREE.Vector3(0, 1, 0));

		console.log('[setFoldObj]', { maxes, foldObj });
		fold.current = foldObj;
	};

	/*
	 * Reads the hierarchical instructions, collecting some descriptive values and initializing state.
	 * This task is greatly simplified by mandating that any one node of the instructional tree
	 * contain EITHER two integer values, or 1+ subnodes. Any node with subnodes may not have integer values.
	 */
	const readInstructionsIntoState = () => {
		if (fold.current.instructions) {
			const maxLevel = calcMaxLevel(fold.current.instructions);
			setFoldState({
				maxLevel: maxLevel,
				selectedLevel: maxLevel - 1,
				stepIdx: -1,
				maxSteps: stepArray.length
			});
		}
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
				const startIdx = faceIdx * 9 + faceVertIdx * 3;

				// Copy over one vertex
				vertices[startIdx] = coords.x;
				vertices[startIdx + 1] = coords.y;
				vertices[startIdx + 2] = coords.z;
			});
		});

		faceGeometry.current.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
	};

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
				const startIdx = faceIdx * 9 + faceVertIdx * 3;

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
		let curStep = foldState.stepIdx;
		if (curStep < -1 || curStep >= foldState.maxSteps) {
			curStep = -1;
		}
		const diff = curStep - prevStep;
		console.log('[performInstructions] ', `${prevStep} + ${diff} = ${curStep}`);

		if (diff > 0) {
			for (let i = 1; i <= diff && stepArray[prevStep + i]; i++) {
				console.log("HITTING! ", i, diff)
				// The first item in the stepArray is the path, not a cmd
				performCommands(fold.current, stepArray[prevStep + i].slice(1));
			}
		} else if (diff < 0) {
			// To do reverse steps, we're just performing fold commands with whatever the prev val was
			for (let i = 0; i > diff && stepArray[prevStep + i]; i--) {
				performReverseCommands(stepArray[prevStep + i].slice(1), prevStep + i);
			}
		}

		refreshFaceVertices();

		setPrevStep(curStep);
	};

	/**
	 * This is a wrapper for performCommands that instead of performing a command, figured out
	 * what would need to be done to "undo" that command, then does that.
	 * This is done dyanimcally - this is an obvious target for future performance improvements,
	 * since this could be calculated on an going basis and stored. It helps that these arrs are short.
	 * @param step the object for the step to reverse. 2D or 3D array.
	 * @param idx the index of this step in the stepArray
	 * @param inSubIdx the inner index for a substep, i.e. child of a 3D array - usually N/A 
	 */
	const performReverseCommands = (step, idx, inSubIdx) => {
		console.log("[performReverseCommands]", {step, idx, inSubIdx});
		// If this is a 3D object, just perform this on all subobjects & exit
		if (stepIs3D(step)) {
			step.reverse().forEach((subCmd, revIdx) => performReverseCommands(subCmd, idx, step.length - (revIdx + 1)));
			return;
		}

		// This tracks the edges that we still need to find an angle for
		const vertsToDo = step.map(arr => [arr[0], arr[1]]);
		let newCmds = [];

		// Check all the previous substeps in this step for previous fold values
		if (inSubIdx !== undefined) {
			for (let j = inSubIdx - 1; j >= 0 && vertsToDo.length; j--) {
				// We know these are 2D (could never have substeps)
				stepArray[idx][j + 1].forEach(cmd => findLastUsedAngles(cmd, vertsToDo, newCmds));
			}
		}

		// Check every step before this one for previous fold values
		for (let j = idx - 1; j >= 0 && vertsToDo.length; j--) {
			stepArray[j].slice(1).forEach(cmd => {
				if (stepIs3D(cmd)) {
					cmd.forEach(subCmd => findLastUsedAngles(subCmd, vertsToDo, newCmds));
				} else {
					findLastUsedAngles(cmd, vertsToDo, newCmds);
				}
			})
		}

		// Any remaining toDo folds should be flattened out
		if (vertsToDo.length) {
			newCmds = newCmds.concat(vertsToDo.map(pair => [...pair, 180]));
		}

		// Perform the reversed instructions for this step
		performCommands(fold.current, newCmds, new Set());
	};

	const findLastUsedAngles = (cmd, vertsToDo, newCmds) => {
		const foundIdx = vertsToDo.findIndex(pair => pair.includes(cmd[0]) && pair.includes(cmd[1]));
		if (foundIdx !== -1) {
			// Mark this angle for use 
			newCmds.push([...vertsToDo[foundIdx], cmd[2]]);

			// Don't keep checking for this fold
			vertsToDo.splice(foundIdx, 1);
		}
	}

	const degToRad = degree => {
		return (degree * Math.PI) / 180;
	};
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
			const third = initFold.vertices_coords[face.find(vertIdx => !edge.includes(vertIdx))];

			const d = (third[0] - start[0]) * (end[2] - start[2]) - (third[2] - start[2]) * (end[0] - start[0]);
			return isLhs ? d > 0 : d < 0;
		});
	};

	/**
	 * Helper function to check if the two vectors are within the same line.
	 */
	const isSameLine = (lhs, rhs) => {
		const crossLen = new THREE.Vector3().crossVectors(lhs, rhs);
		return crossLen.length() < 0.0001; // Account for floating point errors
	};

	/**
	 * This is a very complex step, and best understood by just reading the comments and section titles.
	 * his is taking in an existing triangle (positioned as it actually is in the model
	 * at the moment), the vertex of some triangle that's adjacent to it, and finally an angle in degrees. With this,
	 * this function will figure out where the point would be if you folded this edge completly flat, then rotating the
	 * new triangle by the amount given.
	 *
	 * To make a long story short, this is placing a vertex based on existing ones that we know are in the right place already.
	 *
	 * @props fold - the fold object, which will be mutated by this method
	 * @props vertIdx - the index of the vertex that's being placed
	 * @props edge - array of the two vertIdxs that make up the edge b/w the two faces
	 * @props angle - the angle to rotate the second face around the edge by.
	 */
	const rotateVertAroundEdge = (fold, vertIdx, edge, angle) => {
		const actualXAxis = new THREE.Vector3(1, 0, 0);

		// Read in the positions of the vertices of the edge that we're rotating around
		const start = fold.vertices_coords[edge[0]];
		const end = fold.vertices_coords[edge[1]];

		// ------------------------------------------------------------------------------------------
		// SECTION 1: Figure out where this point would be if the angle were 0 (like in initial fold)
		// ------------------------------------------------------------------------------------------
		// Find the plane formed by the other side of this edge
		const otherFace = fold.faces_vertices.find(
			face => face.includes(edge[0]) && face.includes(edge[1]) && !face.includes(vertIdx)
		);
		const otherVert = otherFace.find(otherVertIdx => !edge.includes(otherVertIdx));
		if (otherFace === null || otherVert === null) {
			// console.log("[rotateVertAroundEdge] ERR: Couldn't find other plane to base rotation in.");
			return;
		}
		const plane = new THREE.Plane().setFromCoplanarPoints(start, end, fold.vertices_coords[otherVert]);

		// const planeOrigin = new THREE.Vector3().copy(plane.normal).multiplyScalar(Math.abs(plane.constant));
		const norm = new THREE.Vector3().copy(plane.normal);
		const normLine = new THREE.Line3(norm.clone().multiplyScalar(-1), norm);
		// const planeOrigin = new THREE.Vector3();
		// plane.intersectLine(normLine, planeOrigin);

		// Get the translation vector from the original plane (i.e. 0,1,0)
		const initStart = new THREE.Vector3(...initFold.vertices_coords[edge[0]]);
		const initEnd = new THREE.Vector3(...initFold.vertices_coords[edge[1]]);
		const initThird = new THREE.Vector3(...initFold.vertices_coords[vertIdx]);

		// If we're starting at the origin, just use the end
		// const useStart = initStart.length() >= 0.0001;
		// const initVal = useStart ? initStart : initEnd;
		// const realVal = useStart ? start : end;
		const diffInPlane = new THREE.Vector3().subVectors(initThird, initStart);
		const edgeInPlane = new THREE.Vector3().subVectors(initEnd, initStart);

		// Angle between the X axis ([1, 0, 0]) and the vector
		let axisRotation = edgeInPlane.angleTo(actualXAxis);
		// If it's in the back quadrants, `angleTo` gets lazy and measures the wrong direction (to the line, not the vector)
		if (edgeInPlane.z < 0) {
			axisRotation = 2 * Math.PI - axisRotation;
			// axisRotation = -axisRotation;
		}

		// X axis starts as the real edge vector
		const xAxis = new THREE.Vector3().subVectors(end, start).normalize();

		// Use this fake x Axis to get a Z axis that's orthag to it and the normal
		const zAxis = new THREE.Vector3().crossVectors(xAxis, plane.normal).normalize();

		// Rotate both the X and Z axiis around the Y (the normal) to get "correct" vals
		xAxis.applyAxisAngle(plane.normal, axisRotation);
		zAxis.applyAxisAngle(plane.normal, axisRotation);

		// We don't care about the y axis, since the paper is flat during this step

		// Figure out where the origin would be, extrapolating from the existing face's position
		// const planeOrigin = new THREE.Vector3().;

		// Create the translation matrix b/w the plane's coords and real coords
		const newCoords = new THREE.Matrix3().set(
			xAxis.x,
			plane.normal.x,
			zAxis.x,
			xAxis.y,
			plane.normal.y,
			zAxis.y,
			xAxis.z,
			plane.normal.z,
			zAxis.z
		);

		// Transform the diff vector to real coords 
		const actualDiff = new THREE.Vector3().copy(diffInPlane).applyMatrix3(newCoords);

		// The third point starts off assuming no rotation
		const third = new THREE.Vector3().addVectors(start, actualDiff);

		// ----------------------------------------------------
		// SECTION 2: Rotate an existing point around this edge
		// ----------------------------------------------------
		let targetVec;

		// If the paper is flat, we can skip this step
		if (Math.abs(angle) === 180) {
			targetVec = third;
		} else {
			// Setup vectors for edge (start --> end), and the target (start --> third)
			const edgeDirection = new THREE.Vector3().subVectors(end, start);
			edgeDirection.normalize();
			targetVec = new THREE.Vector3().subVectors(third, start);

			// console.log('Applying angle to edge', edgeDirection);

			// Rotate the target vector around the edge
			targetVec.applyAxisAngle(edgeDirection, degToRad(180 - angle));

			// Add the start back to the target, giving us the actual final location
			targetVec.add(start);
		}

		// Store the vertex coords for edges + vertices
		fold.vertices_coords[vertIdx] = targetVec;
		console.log(`Rotating ${vertIdx} around (${edge[0]}, ${edge[1]}) by ${angle} to ${printVect(targetVec)}`);
		// console.log('[rotateVertAroundEdge]', {
		// 	// planeOrigin,
		// 	// planeConstant: plane.constant,
		// 	normLine,
		// 	initStart,
		// 	initThird,
		// 	// initVal,
		// 	// useStart,
		// 	// realVal,
		// 	diffInPlane,
		// 	actualDiff,
		// 	axisRotation,
		// 	xAxis,
		// 	zAxis,
		// 	newCoords,
		// 	norm,
		// 	third,
		// 	start,
		// 	end,
		// 	otherVert
		// });
	};

	/*
	 * Applies steps to fold the paper iteratively. The crux of this component - see Paper Engine design document.
	 * @param fold - the object to be modified
	 * @param steps - array of instructions
	 */
	const performCommands = (fold, cmds, vertsMoved = new Set(), edgesMoved = new Set(), level = 0) => {
		console.log('[performCommands] RUN: ', fold && fold.vertices_coords, cmds, level);
		if (!fold || cmds === undefined || level > 5) {
			return null;
		}

		let todoCmds = [];
		// If this is an object, treat it as one cmd
		if (!Array.isArray(cmds)) {
			cmds = [cmds];
		}

		// If this is a 3D array, perform substeps in sequence
		if (cmds.length && cmds[0].length && Array.isArray(cmds[0][0])) {
			console.log("PERFORMING NESTED COMMANDS: ", cmds);
			cmds.forEach(cmdArr => performCommands(fold, cmdArr));
			return;
		}

		cmds.forEach((cmd, cmdIdx) => {
			// Parse the command - 0 & 1 are verts, 2 is foldAngle, and 3 is optional args
			const args = cmd.length === 4 ? cmd[3] : {};
			const edgeVerts = [cmd[0], cmd[1]];
			const edgeIdx = fold.edges_vertices.findIndex(edge => edge.includes(cmd[0]) && edge.includes(cmd[1]));

			// Get the face that includes this edge on the right or left hand side, depending on the cmd args
			const faceIdx = faceToFoldForEdge(fold.faces_vertices, edgeVerts, args.lhs);

			// Find the index of the the third point in this triangle
			const thirdIdx = fold.faces_vertices[faceIdx].find(vertIdx => !edgeVerts.includes(vertIdx));

			// Store the two other edges of the triangle
			const edgeIndices = fold.edges_vertices.reduce(
				(acc, edge, idx) => {
					if (edge.includes(edgeVerts[0]) && edge.includes(thirdIdx)) {
						acc[0] = idx;
					} else if (edge.includes(edgeVerts[1]) && edge.includes(thirdIdx)) {
						acc[1] = idx;
					}
					return acc;
				},
				[-1, -1]
			);

			// Get the angle to rotate these edges (last used, or default to 180)
			const foldAngleOne =
				edgeIndices[0] < fold.edges_foldAngle.length && edgeIndices[0] > 0
					? fold.edges_foldAngle[edgeIndices[0]]
					: 180;
			const foldAngleTwo =
				edgeIndices[1] < fold.edges_foldAngle.length && edgeIndices[1] > 0
					? fold.edges_foldAngle[edgeIndices[1]]
					: 180;

			const newCmds = [
				[edgeVerts[0], thirdIdx, foldAngleOne],
				[thirdIdx, edgeVerts[1], foldAngleTwo]
			];

			// Inspect both of the other newCmds - if they're novel, fold them as well
			// NOTE: the edge pointed to by the associated edgeIdx might be reversed
			// from what we're looking at; this is okay, since we're just using the indices
			// to ensure uniqueness here
			edgeIndices.forEach((edgeIdx, triIdx) => {
				if (
					!edgesMoved.has(edgeIdx) &&
					!isEdgeOfPaper(edgeIdx) &&
					!hasCmds(todoCmds, newCmds[triIdx]) &&
					newCmds[triIdx][2] !== undefined
				) {
					// Mark this edge to be moved next
					todoCmds.push(newCmds[triIdx]);
				}
			});

			// Store the fold angle
			fold.edges_foldAngle[edgeIdx] = cmd[2];

			// Remember that we folded this edge, to simulate paper creases
			if (cmd[2] !== 180) {
				creasedEdges.current.add(edgeIdx);
			}

			// Check if we've already pocessed this edge
			if (faceIdx === -1 || edgesMoved.has(edgeIdx)) {
				// console.log(`Edge (${edgeVerts[0]}, ${edgeVerts[1]}) already moved`);
				return;
			}
			edgesMoved.add(edgeIdx);
			if (vertsMoved.has(thirdIdx)) {
				// console.log(`Vert ${thirdIdx} already moved.`);
				return;
			}
			vertsMoved.add(thirdIdx);
			if (level === 0) {
				vertsMoved.add(edgeVerts[0]);
				vertsMoved.add(edgeVerts[1]);
			}

			// Rotate the third vertex around this edge
			rotateVertAroundEdge(fold, thirdIdx, edgeVerts, -cmd[2]);
			console.log('[performCommands]', { newCmds });
		});

		// Do recursive call for every edge in the todo list
		if (todoCmds.length) {
			performCommands(fold, todoCmds, vertsMoved, edgesMoved, level + 1);
		}
	};

	const cmdsShareEdge = (lhs, rhs) => {
		const lhsSlice = lhs.slice(0, 2);
		return lhsSlice.includes(rhs[0]) && lhsSlice.includes(rhs[1]);
	};

	const hasCmds = (edgesList, edge) => {
		return edgesList.some(otherEdge => cmdsShareEdge(edge, otherEdge));
	};

	/**
	 * Returns true if this vertex is on the very edge of the paper, false otherwise.
	 */
	const vertIsOnEdge = vertCoords => Math.abs(vertCoords[0]) === 1 || Math.abs(vertCoords[2]) === 1;

	/**
	 * Returns true if this edge is on the very edge of the paper, false otherwise.
	 */
	const isEdgeOfPaper = edgeIdx => {
		// If this edge was created during triangulization, it can't be an edge
		if (!initFold || edgeIdx < 0 || edgeIdx >= initFold.edges_vertices.length) {
			return false;
		}

		// Find the coordinates of the vertices for this edge
		const edge = initFold.edges_vertices[edgeIdx];
		const coordsArr = edge.map(vertIdx => initFold.vertices_coords[vertIdx]);

		// If both vertices are on the edge, this edge is on the edge
		return vertIsOnEdge(coordsArr[0]) && vertIsOnEdge(coordsArr[1]);
	};

	/**
	 * Prints a THREE.Vector3 object.
	 */
	const printVect = vect => `${vect.x.toFixed(2)}, ${vect.y.toFixed(2)}, ${vect.z.toFixed(2)}`;

	const hoverVert = (idx, event, show) => {
		ctrlOverlay({
			show,
			name: 'vert_' + idx,
			component: (
				<Chip
					className={classes.vertLabel}
					style={{ left: event.pageX + 10, top: event.pageY + 10 + 64 }}
					label={fold.current && `${idx}: ${printVect(fold.current.vertices_coords[idx])}`}
				/>
			)
		});
	};

	const buildStepArray = () => collectStepsForLevel(fold.current, foldState.selectedLevel, foldState.usingDefaults);

	// ---------
	// LIFECYCLE
	// ---------
	useFrame(() => {
		// rotation.current = [0, rotation.current[1] + 1, 0];
	});

	const material = useMemo(createMaterial, []);
	const stepArray = useMemo(buildStepArray, [
		!fold.current || !fold.current.instructions,
		foldKey,
		foldState.selectedLevel
	]);

	useEffect(performInstructions, [foldState.stepIdx]);
	useEffect(initFoldState, [foldKey]);
	useEffect(readInstructionsIntoState, [foldKey, stepArray.length]);

	console.log('[Paper]', { stepArray });

	if (!initFold) {
		return null;
	}

	return (
		<group>
			{editorState.showEdges &&
				fold.current &&
				fold.current.edges_vertices.map((line, idx) =>
					(idx >= initFold.edges_vertices.length && !editorState.showTriangulations) ||
					(creasedEdges.current.length > 0 && !creasedEdges.current.has(idx)) ? null : (
						<Line
							points={line.map(index => fold.current.vertices_coords[index])}
							color={
								idx < initFold.edges_vertices.length
									? editorState.edgeHighlights.includes(idx)
										? 'red'
										: 'black'
									: 'yellow'
							}
							lineWidth={1}
							dashed={idx >= initFold.edges_vertices.length}
							material={material}
							dashSize={0.1}
							gapSize={0.1}
							key={idx}
						/>
					)
				)}
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
				<a.mesh geometry={faceGeometry.current} material={material}></a.mesh>
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
