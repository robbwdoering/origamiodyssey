/**
 * FILENAME: Body.js 
 *
 * DESCRIPTION: The main body of the app, where most instruction, navigation, and animation happens. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

import { SwipeableDrawer, Button, List, Divider, ListItem, } from '@material-ui/core';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import { Pages, initNavTree } from "./../infra/constants";
import { setLayoutState } from "./../infra/actions";
import Splash from "./pages/Splash";
import ModelSelect from "./pages/ModelSelect";
import FoldControls from "./pages/FoldControls";
import User from "./pages/User";
import Scene from "./../anim/Scene";
import useStyles from "./../style/theme";

export const Body = props => {
	const { layoutState, setLayoutState } = props;

	// ----------
	// STATE INIT 
	// ----------
	const classes = useStyles();
	const containerRef = useRef();
	const [curHash, setHash] = useState(0);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------
	const renderPage = () => {
		const pageProps = {};

		switch (layoutState.page) {
			case Pages.Splash:
				return <Splash {...pageProps} />;
			case Pages.ModelSelect:
				return <ModelSelect {...pageProps} />;
			case Pages.User:
				return <User {...pageProps} />;
			case Pages.Fold:
			default: 
				return null;
		}
	};

	const renderPiecemeal = () => {
		const pageProps = { windowHeight };

		switch (layoutState.page) {
			case Pages.Fold:
				return <FoldControls {...pageProps} />;
			case Pages.Splash:
			case Pages.ModelSelect:
			case Pages.User:
			default: 
				return null;
		}
	};

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	// ---------
	// LIFECYCLE
	// ---------
	// Rerender whenever the page resizes
	useEffect(() => {
		window.addEventListener("resize", triggerRerender);
	}, []);

	// Calculate height of window-matching containers 
	const windowHeight = useMemo(() => {
		// The scene always fills the window after accounting for the AppBar
		return window.innerHeight - 64;
	}, [curHash]);

	const page = useMemo(renderPage, [layoutState.page]);
	const piecemeal = useMemo(renderPiecemeal, [layoutState.page, windowHeight]);

	return (
		<div className={classes.bodyContainer} ref={containerRef}>
			<div className={classes.sceneContainer} style={{height: windowHeight + 'px'}}>
				<Scene paperSize={windowHeight} />
			</div>
			{page && (
				<div className={classes.centerColumn} style={{height: windowHeight + 'px'}}>
					{renderPage()}
				</div>
			)}
			{piecemeal && (
			<div className={classes.piecemealContainter}>
				{renderPiecemeal()}
			</div>
			)}
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash
	};
};

export default connect(mapStateToProps, { setLayoutState })(Body);
