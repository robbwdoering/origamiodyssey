/**
 * FILENAME: Scene.js 
 *
 * DESCRIPTION: Renders the basic of the animation. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

import { Pages } from "./../constants";
import Splash from "./pages/Splash";
import Lesson from "./pages/Lesson";

export const Body = props => {
	const { page } = props;

	const renderPage = () => {
		switch (page) {
			case Pages.Splash:
				return <Splash />;
			// case Pages.Lesson:
			// 	return <Lesson />;
			default:
				return <div> error! </div>;
		}	
	};

	return (
		<div className="body">
			Maybe we don't need pages...
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		page: state.appReducer.page	
	};
};

export default connect(mapStateToProps, {})(Body);
