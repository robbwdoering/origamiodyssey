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
import Lesson from "./pages/Lesson";
import Scene from "./../anim/Scene";
import useStyles from "./../style/theme";

export const Body = props => {
	const { page, setLayoutState } = props;

	const styles = useStyles();

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
			<div className={styles.sceneContainer}>
				<Scene />
			</div>
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		page: state.appReducer.page,
	};
};

export default connect(mapStateToProps, { setLayoutState })(Body);
