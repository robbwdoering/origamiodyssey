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
import { a, useTransition, Transition } from '@react-spring/three';

import { Paper } from "./../paper/Paper";

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
		gl.setClearColor(0x080405, 1);
		return controls.current.update();
	});

	return (
		<orbitControls
			ref={controls}
			args={[camera, domElement]}
			enableZoom={false}
			enableRotate={true}
			enableDolly={false}
			mouseButtons={{
				RIGHT: THREE.MOUSE.ROTATE
			}}
			maxAzimuthAngle={Math.PI / 4}
			maxPolarAngle={Math.PI}
			minAzimuthAngle={-Math.PI / 4}
			minPolarAngle={0}
		/>
	);
};

/**
 * Main component.
 */
export const Scene = props => {
	const {} = props;

	const canvas = useRef();

	return (
		<React.Fragment>
			<Canvas ref={canvas} camera={{fov: 100, position: [0, 6, 0]}} >
				<spotLight position={[5, 10, 0]} color='#f1f1ff' distance={100} penumbra={0.75} decay={2} />
				<CameraControls />

				<Paper
					position={[0, 0, 0]}
					scale={5}
				/>
			</Canvas>
		</React.Fragment>
	);
};

export const mapStateToProps = (state, props) => {
	return {};
};

export default connect(mapStateToProps, {})(Scene);
