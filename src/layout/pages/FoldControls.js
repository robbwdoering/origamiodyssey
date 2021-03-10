/**
 * FILENAME: FoldControls.js 
 *
 * DESCRIPTION: This page allows the user to browser through cards, read details on models, and select one to fold. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config }  from 'react-spring';

import { SwipeableDrawer, Button,  ButtonGroup, List, Divider, ListItem, Card } from '@material-ui/core';
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import SkipNext from "@material-ui/icons/SkipNext";

import useStyles from "./../../style/theme";
import { Folds } from "./../../infra/constants";
// const AnimatedCard = animated(Card);

export const FoldControls = props => {
	const { windowHeight } = props;

	// ----------
	// STATE INIT 
	// ----------
	const classes = useStyles();
	const [cardRefs, setCardRefs] = useState([]);
	const [curHash, setHash] = useState(0);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------

	// Changes the current instructional sequential step, prompting animation.
	const changeStep = (delta) => {
	};

	const calcControlsPosition = () => {
		return (window.innerWidth - 128) / 2;
	}

	// ---------
	// LIFECYCLE
	// ---------

	const buttonClasses = useMemo(() => ({
		root: classes.fold_controls_button,
		label: classes.fold_controls_button_label
	}), []);

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	// Rerender whenever the page resizes
	useEffect(() => {
		window.addEventListener("resize", triggerRerender);
	}, []);

	const ctrlLeft = useMemo(calcControlsPosition, [window.innerWidth]);

    return (
    	<React.Fragment>
			<Card className={classes.fold_controls} style={{left: ctrlLeft}} >
				<ButtonGroup className={classes.fold_controls_button_container} color="primary" variant="text">
					<Button classes={buttonClasses} onClick={() => changeStep(-1)}>
						<SkipPrevious className={classes.fold_controls_button_icon} />
						Prev	
					</Button>
					<Button classes={buttonClasses} onClick={() => changeStep(1)}>
						<SkipNext className={classes.fold_controls_button_icon} />
						Next	
					</Button>
				</ButtonGroup>
    		</Card>
    		<div className={classes.foldCtrl_diagrams_container}> DIAGRAMS GO HERE </div>
    	</React.Fragment>
    );
};

export const mapStateToProps = (state, props) => {
	return {
	};
};

export default connect(mapStateToProps, {})(FoldControls);
