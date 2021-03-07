/**
 * FILENAME: FoldControls.js 
 *
 * DESCRIPTION: This page allows the user to browser through cards, read details on models, and select one to fold. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config }  from 'react-spring';

import { SwipeableDrawer, Button, List, Divider, ListItem, Card } from '@material-ui/core';

import useStyles from "./../../style/theme";
import { Folds } from "./../../infra/constants";
// const AnimatedCard = animated(Card);

export const FoldControls = () => {
	const classes = useStyles();

	// ----------
	// STATE INIT 
	// ----------
	const [cardRefs, setCardRefs] = useState([]);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------

	// ---------
	// LIFECYCLE
	// ---------


    return (
    	<React.Fragment>
    		<div className={classes.foldCtrl_controls_container}> CONTROLS GO HERE </div>
    		<div className={classes.foldCtrl_diagrams_container}> DIAGRAMS GO HERE </div>
    	</React.Fragment>
    );
};

export const mapStateToProps = (state, props) => {
	return {
	};
};

export default connect(mapStateToProps, {})(FoldControls);
