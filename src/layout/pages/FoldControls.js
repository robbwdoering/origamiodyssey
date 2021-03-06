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

	const selectCardList = () => {
		return Object.keys(Folds).filter(() => true);
	};


	const createCard = () => {

	}


	const updateCardRefs = () => {
		// Recreate the refs array, reusing elements. Note that this algo doesn't support reordering
		setCardRefs(elRefs => (
			Array(cardList.length).fill().map((el, i) => cardRefs[i] || createRef())
		));
	};


	// ---------
	// LIFECYCLE
	// ---------

	const cardList = useMemo(selectCardList, []);

	useEffect(updateCardRefs, [cardList.length]);

    return (
        <div className={classes.FoldControls.container}>
        </div>
    );
};

export const mapStateToProps = (state, props) => {
	return {
	};
};

export default connect(mapStateToProps, {})(FoldControls);
