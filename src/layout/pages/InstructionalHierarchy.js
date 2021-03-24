/**
 * FILENAME: InstructionalHierarchy.js 
 *
 * DESCRIPTION: These are piecemeal controls for the fold state. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config }  from 'react-spring';

import { SwipeableDrawer, Tooltip, Fab, ButtonGroup, List, Divider, ListItem, Card } from '@material-ui/core';
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import SkipNext from "@material-ui/icons/SkipNext";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";

import useStyles from "./../../style/theme";
import { Folds } from "./../../infra/constants";
import { setFoldState, setLayoutState } from "./../../infra/actions";
import { collectStepsForLevel, calcMaxLevel } from './../../infra/utils';

export const InstructionalHierarchy = props => {
	const { windowHeight, initFold, foldLastUpdated, foldState, foldStateHash, setFoldState, layoutState, layoutStateHash, setLayoutState  } = props;

	// ----------
	// STATE INIT 
	// ----------
	const classes = useStyles();
	const cardRef = useRef();
	const renderRows = useRef([]);
	const [curHash, setHash] = useState(0);

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------

	// Changes the current instructional sequential step, prompting animation.
	const changeStep = (delta) => {
		let newStepIndex = Math.min(Math.max(foldState.stepIdx + delta, -1), foldState.maxSteps);
		setFoldState({
			stepIdx: newStepIndex
		});
	};

	const calcCardPos = () => {
		let style = {
			height: layoutState.expandHierarchy ? '256px' : '128px',
			width: '100%',
			maxWidth: layoutState.expandHierarchy ? '1200px' : '600px',
		};

		style.left = ((window.innerWidth - parseInt(style.maxWidth)) / 2) + "px";
		style.bottom = layoutState.expandHierarchy ? '32px' : '128px';

		console.log("instruction style", style);

		return style;
	}

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	const handleExpandClick = e => {
		setLayoutState({ expandHierarchy: !layoutState.expandHierarchy });
	}


	const buildStepArray = () => collectStepsForLevel(initFold, foldState.selectedLevel);

	// ---------
	// LIFECYCLE
	// ---------

	const buttonClasses = useMemo(() => ({
		root: classes.fold_controls_button,
		label: classes.fold_controls_button_label
	}), []);

	// Rerender whenever the page resizes
	useEffect(() => {
		window.addEventListener("resize", triggerRerender);
	}, []);

	const cardStyle = useMemo(calcCardPos, [window.innerWidth, window.innerHeight, layoutState.expandHierarchy]);

	const stepArray = useMemo(buildStepArray, [
		!initFold || !initFold.instructions,
		layoutState.currentFold,
		foldState.selectedLevel
	]);

	const renderNode = (inst, renderRows, levelIdx, path, stepIdx) => {
		console.log("[renderNode]", levelIdx, path, stepIdx);
		if (levelIdx > maxLevel) {
			return [1, stepIdx];
		}
		// Set width in units for flexbox
		let width = 0;
		let children = [];
		const isSelectedLevel = foldState.selectedLevel === levelIdx || (foldState.selectedLevel > levelIdx && !children.length);
		let retStepIdx = isSelectedLevel ? stepIdx : stepIdx + 1;

		const style = {};

		// Base case: This is a leaf node
		if (inst.children.length && Array.isArray(inst.children[0])) {
			width = 1;

			style.flexGrow = width;

			// Add spacers to all rows below, if necessary
			for (let i = levelIdx + 1; i < maxLevel; i++) {
				renderRows[i].push(<div className={classes.hier_node_spacer} style={style}  key={pathToKey(path)+"spacer"+i}/>)
			}
		} else if (inst.children.length) {
			[width, children] = inst.children.reduce((acc, child, childIdx) => {
				const [childWidth, childStepIdx] = renderNode(child, renderRows, levelIdx + 1, path.concat([childIdx]), retStepIdx);
				retStepIdx = childStepIdx;
				acc[0] += childWidth;
				return acc;
			}, [0, []]);

			style.flexGrow = width;
		}

		let type = 'default';

		if (isSelectedLevel && stepIdx === foldState.stepIdx) {
			// These nodes are part of the current step array
			type = "active";
		} else if (isSelectedLevel) {
			// These nodes are part of the current step array
			type = "inUse";
		};

		renderRows[levelIdx].push(
			// <Tooltip title="This is a node in the instructional hierarchy." placement="bottom-start">
				<div className={`${classes.hier_node} ${classes['hier_node__'+type]}`} style={style} key={pathToKey(path)}/>
			// </Tooltip>
		);

		return [width, retStepIdx];
	};

	const pathToKey = path => path.reduce((acc, idx) => acc + ',' + idx, '');

	const refreshRenderRows = () => {
		if (!initFold) {
			return;
		};

		console.log("[refreshRenderRows]", initFold.instructions, maxLevel);

		let tmpRows = [];
		for (let i = 0; i < maxLevel; i++) {
			tmpRows.push([]);
		}

		renderNode(initFold.instructions, tmpRows, 0, [0], 0);

		renderRows.current = tmpRows;
		console.log("renderRows: ", renderRows.current);
	}

	const maxLevel = useMemo(() => calcMaxLevel(initFold.instructions), [foldLastUpdated])

	useEffect(refreshRenderRows, [foldState.selectedLevel, foldLastUpdated]);

	console.log("[InstructionalHierarchy]", renderRows.current);

    return (
    	<React.Fragment>
			<Card className={classes.hier_card} style={cardStyle} ref={cardRef} >
				<Fab aria-label="expand instructions" className={classes.hier_expandCtrl} onClick={handleExpandClick} color="secondary" size="small">
					{layoutState.expandHierarchy ? <ExpandLess /> : <ExpandMore />}
				</Fab>
				<div className={classes.hier_container}>
					{initFold && renderRows.current.reduce((acc, row, idx) => {
						if (idx !== 0 && idx <= 5) {
							acc.push(
								<div className={classes.hier_node_container}>
									{row}
								</div>
							);
						}
						console.log("acc: ", acc);
						return acc;
					}, [])}
				</div>	
    		</Card>
    	</React.Fragment>
    );
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash,
		foldState: state.appReducer.foldState,
		foldStateHash: state.appReducer.foldState.hash
	};
};

export default connect(mapStateToProps, { setFoldState, setLayoutState })(InstructionalHierarchy);
