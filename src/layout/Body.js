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

	const classes = useStyles();
	const containerRef = useRef();
	const [curHash, setHash] = useState(0);

	const renderPage = () => {
		const pageProps = {};
		console.log("renderPage", layoutState.page);

		switch (layoutState.page) {
			case Pages.Splash:
				return <Splash {...pageProps} />;
			case Pages.ModelSelect:
			console.log("MODEL!")
				return <ModelSelect {...pageProps} />;
			case Pages.Fold:
				return <FoldControls {...pageProps} />;
			case Pages.User:
				return <User {...pageProps} />;
			default: 
				console.log("default!")
				return <div />;
		}
	};

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	const sceneHeight = useMemo(() => {
		// The scene always fills the window after accounting for the AppBar
		return window.innerHeight - 64;
	}, [curHash]);

	useEffect(() => {
		window.addEventListener("resize", triggerRerender);
	}, []);

	return (
		<div className={classes.bodyContainer} ref={containerRef}>
			<div className={classes.sceneContainer} style={{height: sceneHeight + 'px'}}>
				<Scene paperSize={sceneHeight} />
			</div>
			<div className={classes.centerColumn}>
				{renderPage()}
			</div>
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutStateHash
	};
};

export default connect(mapStateToProps, { setLayoutState })(Body);
