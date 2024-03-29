/**
 * FILENAME: Scene.js 
 *
 * DESCRIPTION: Renders the basic of the animation. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

// Threejs - 3D Animation
import { Canvas, useFrame, useThree, useLoader, extend } from 'react-three-fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// React Spring - animation
import { useUpdate, useSpring, useSprings, animated, config }  from 'react-spring';
// import { a, useTransition, Transition } from '@react-spring/three';

import { Paper } from "./Paper";
import { Pages, Folds } from "./../infra/constants";
import { setLayoutState, setFoldState } from "./../infra/actions";

// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
extend({ OrbitControls });

const CameraControls = () => {
	// Get a reference to the Three.js Camera, and the canvas html element.
	// We need these to setup the OrbitControls class.
	// https://threejs.org/docs/#examples/en/controls/OrbitControls
	const {
		camera,
		gl: { domElement }
	} = useThree();

	const controls = useRef();

	useFrame(({ gl }) => {
		gl.setClearColor(0xf1f4f4, 1);
		return controls.current.update();
	});

	return (
		<orbitControls
			ref={controls}
			args={[camera, domElement]}
			enableZoom={true}
			enableRotate={true}
			enableDolly={false}
			mouseButtons={{
				RIGHT: THREE.MOUSE.ROTATE,
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.PAN,
			}}
			// maxAzimuthAngle={Math.PI / 4}
			// maxPolarAngle={Math.PI * 3 / 4}
			// minAzimuthAngle={-Math.PI / 4}
			// minPolarAngle={-Math.PI * 3 / 4}
		/>
	);
};

/**
 * Main component.
 */
export const Scene = props => {
	const { initFold, foldLastUpdated, paperSize, layoutState, layoutStateHash, foldState, foldStateHash, setFoldState, editorState, editorStateHash } = props;
	const [overlays, setOverlays] = useState({});
	const [overlayPos, setOverlayPos] = useState({});

	const ctrlOverlay = inArr => {
		const newOverlays = Object.assign({}, overlays);
		const newOverlayPos = Object.assign({}, overlayPos);

		inArr.forEach(({ show, name, component, pos }) => {
			if (show) {
				newOverlays[name] = component;

				if (pos) {
					overlayPos[name] = pos;
				}
			} else if (!show && newOverlays[name]) {
				delete newOverlays[name];
				delete overlayPos[name];
			}
		})

		setOverlays(newOverlays);
		setOverlayPos(overlayPos)
	}

	return (
		<React.Fragment>
			<Canvas camera={{fov: 100, position: [0, 1.8, 0]}} onCreated={state => state.gl.setClearColor("red")} >
				<spotLight position={[5, 10, 0]} color='#f1f1ff' distance={100} penumbra={0.75} decay={2} />
				<CameraControls />

				<Paper
					position={[0, 0, 0]}
					scale={10}
					initFold={initFold}
					foldLastUpdated={foldLastUpdated}
					foldKey={layoutState.curFold}
					foldState={foldState}
					foldStateHash={foldStateHash}
					editorState={editorState}
					editorStateHash={editorStateHash}
					setFoldState={setFoldState}
					initStep={-1}
					ctrlOverlay={ctrlOverlay}
					overlayPos={overlayPos}
				/>
			</Canvas>
			{Object.values(overlays)}
		</React.Fragment>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash,
		foldState: state.appReducer.foldState,
		foldStateHash: state.appReducer.foldState.hash,
		editorState: state.appReducer.editorState,
		editorStateHash: state.appReducer.editorState.hash,
	};
};

export default connect(mapStateToProps, { setLayoutState, setFoldState })(Scene);
