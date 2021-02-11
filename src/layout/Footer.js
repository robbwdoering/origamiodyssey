/**
 * FILENAME: Scene.js 
 *
 * DESCRIPTION: Renders the basic of the animation. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

export const Footer = props => {
	const { } = props;

	return (
		<div className="footer">
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {};
};

export default connect(mapStateToProps, {})(Footer);
