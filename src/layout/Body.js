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
import { useCookies } from "react-cookie";

import { Pages, Folds, initNavTree } from "./../infra/constants";
import { setLayoutState, setFoldState } from "./../infra/actions";
import Splash from "./pages/Splash";
import ModelSelect from "./pages/ModelSelect";
import FoldControls from "./pages/FoldControls";
import FoldEditorCards from "./pages/FoldEditorCards";
import User from "./pages/User";
import Scene from "./../anim/Scene";
import useStyles from "./../style/theme";

export const Body = props => {
	const { layoutState, setLayoutState, foldState, foldStateHash, layoutStateHash, setFoldState } = props;

	// ----------
	// STATE INIT 
	// ----------
	const classes = useStyles();
	const containerRef = useRef();
	const [curHash, setHash] = useState(0);
	const [cookies, setCookies] = useCookies([]);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------
	const selectFold = () => {
		return (layoutState.curFold && Folds[layoutState.curFold]) ? Folds[layoutState.curFold].json : null;
	};

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
		const pageProps = { windowHeight, initFold: fold };

		switch (layoutState.page) {
			case Pages.Fold:
				return (
					<React.Fragment>
						<FoldControls {...pageProps} />

						{layoutState.showEditor && (
							<FoldEditorCards {...pageProps} />
						)}
					</React.Fragment>
				);
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

	const saveStateToCookies = () => {
		console.log("Saving state to cookies");
		setCookies('origamiodyssey_state', { layoutState, foldState }, { path: "/" });
	}

	const fetchStateFromCookies = () => {
		console.log("Applying state from cookies.");
		if (cookies.origamiodyssey_state) {
			setLayoutState(cookies.origamiodyssey_state.layoutState);
			setFoldState(cookies.origamiodyssey_state.foldState);
		}
	}

	// ---------
	// LIFECYCLE
	// ---------
	// Rerender whenever the page resizes
	useEffect(() => {
		window.addEventListener("resize", triggerRerender);
		window.addEventListener("beforeunload", saveStateToCookies);

		fetchStateFromCookies();
	}, []);

	// Get the actual JSON for whatever fold name is selected 
	const fold = useMemo(selectFold, [layoutState.curFold]);

	// Calculate height of window-matching containers 
	const windowHeight = useMemo(() => {
		// The scene always fills the window after accounting for the AppBar
		return window.innerHeight - 64;
	}, [curHash]);

	const page = useMemo(renderPage, [layoutState.page]);
	const piecemeal = useMemo(renderPiecemeal, [layoutState.page, windowHeight]);

	// console.log("[body]", layoutState);

	return (
		<div className={classes.bodyContainer} ref={containerRef}>
			<div className={classes.sceneContainer} style={{height: windowHeight + 'px'}}>
				<Scene paperSize={windowHeight} initFold={fold} />
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
		layoutStateHash: state.appReducer.layoutState.hash,
		foldState: state.appReducer.foldState,
		foldStateHash: state.appReducer.foldState.hash,
	};
};

export default connect(mapStateToProps, { setLayoutState, setFoldState })(Body);
