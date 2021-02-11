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

	return (
	    <a.mesh position={position} scale={[scale, 0.05, scale]} >
	        <boxBufferGeometry attach="geometry" args={[0.2, 0.2, 0.2]} />
	        <meshStandardMaterial roughness={0.5} attach="material" color='#ef626c' />
	    </a.mesh>
    );
}
