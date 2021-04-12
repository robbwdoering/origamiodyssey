/**
 * FILENAME: InstructionalHierarchy.js
 *
 * DESCRIPTION: These are piecemeal controls for the fold state.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';

import { SwipeableDrawer, Tooltip, Typography, Fab, ButtonGroup, List, Divider, ListItem, Card } from '@material-ui/core';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import SkipNext from '@material-ui/icons/SkipNext';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

import useStyles from './../../style/theme';
import { Folds } from './../../infra/constants';
import { setFoldState, setLayoutState } from './../../infra/actions';
import { collectStepsForLevel, calcMaxLevel, printPath, findInUseFamilyNode, getHierNode } from './../../infra/utils';

const HIER_PX_SIZE = 20;

export const InstructionalHierarchy = props => {
	const {
		windowHeight,
		initFold,
		foldLastUpdated,
		foldState,
		foldStateHash,
		setFoldState,
		layoutState,
		layoutStateHash,
		setLayoutState
	} = props;

	// ----------
	// STATE INIT
	// ----------
	const [contStyle, setContStyle] = useState({});
	const classes = useStyles();
	const cardRef = useRef();
	const renderRows = useRef([]);
	const [curHash, setHash] = useState(0);

	const maxLevel = useMemo(() => calcMaxLevel(initFold && initFold.instructions), [foldLastUpdated]);

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------

	// Changes the current instructional sequential step, prompting animation.
	const changeStep = delta => {
		let newStepIndex = Math.min(Math.max(foldState.stepIdx + delta, -1), foldState.maxSteps);
		setFoldState({
			stepIdx: newStepIndex
		});
	};

	const calcCardPos = () => {
		let style = {
			// Don't show first column, and account for padding
			width: (maxLevel - 1) * HIER_PX_SIZE + 14 + 'px'
		};

		return style;
	};

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	const handleExpandClick = e => {
		setLayoutState({ expandHierarchy: !layoutState.expandHierarchy });
	};

	const handleHierNodeClick = path => {
		const stepIdx = stepArray.findIndex(step => path === step[0]);
		const newState = {};

		if (stepIdx !== -1) {
			// If it's in the stepArray, just set the index to that element
			newState.stepIdx = stepIdx - 1;
		} else {
			// Else we need to find whatever in use index corresponds
			const inUseIndex = findInUseFamilyNode(stepArray, path);
			if (inUseIndex !== -1) {
				newState.stepIdx = inUseIndex - 1;
			}
		}

		setFoldState(newState);
	};

	const buildStepArray = () => collectStepsForLevel(initFold, foldState.selectedLevel, foldState.usingDefaults);

	const renderNode = (inst, renderRows, levelIdx, path, belowDefault) => {
		// Error case - we're on a level deeper than the tree supports
		if (levelIdx > maxLevel) {
			return [1, stepIdx];
		}
		let height = 0;
		let children = [];
		const isDefaultNode = foldState.usingDefaults && inst.default;
		const isSelectedLevel =
			isDefaultNode ||
			foldState.selectedLevel === levelIdx ||
			(foldState.selectedLevel > levelIdx && !inst.children.length);
		const isLeaf = inst.children.length && Array.isArray(inst.children[0]);
		const stepIdx = stepArray.findIndex(step => path === step[0]);

		const style = {};

		if (isLeaf) {
			// Base case: This is a leaf node
			height = 1;

			style.flexGrow = height;

			// Add spacers to all rows below, if necessary
			for (let i = levelIdx + 1; i < maxLevel; i++) {
				renderRows[i].push(
					<div className={`${classes.hier_node_anchor}`} style={style}>
						<div className={`${classes.hier_node} ${classes.hier_node_spacer}`} key={path + 'spacer' + i} />
					</div>
				);
			}
		} else if (inst.children.length) {
			// Recursive case: this node has children, so it's as tall as all of them combined
			[height, children] = inst.children.reduce(
				(acc, child, childIdx) => {
					const childHeight = renderNode(
						child,
						renderRows,
						levelIdx + 1,
						`${path},${childIdx}`,
						belowDefault || isDefaultNode
					);
					acc[0] += childHeight;
					return acc;
				},
				[0, []]
			);

			style.flexGrow = height;
		}

		let type = 'default';

		if (stepIdx === foldState.stepIdx + 1) {
			// This node is the current step (i.e. haven't folded yet)
			type = 'active';
		} else if (isSelectedLevel || (foldState.selectedLevel > levelIdx && isLeaf && !belowDefault)) {
			// These nodes are part of the current step array
			type = 'inUse';
		}

		const pxHeight = HIER_PX_SIZE * style.flexGrow - 4;

		// console.log('[renderNode]', stepArray, levelIdx, path, stepIdx, foldState.stepIdx, type, isSelectedLevel);
		renderRows[levelIdx].push(
			<Tooltip
				title={inst.desc}
				placement="bottom-start"
				classes={{ popper: classes.hier_node_tooltip }}
				key={path}
			>
				<div className={`${classes.hier_node_anchor}`} style={style} onClick={() => handleHierNodeClick(path)}>
					<div
						className={`${classes.hier_node} ${classes['hier_node__' + type]}`}
						style={{ height: pxHeight }}
					/>
				</div>
			</Tooltip>
		);

		return height;
	};

	const refreshRenderRows = cardStyle => {
		if (!initFold) {
			return;
		}

		let tmpRows = [];
		for (let i = 0; i < maxLevel; i++) {
			tmpRows.push([]);
		}

		renderNode(initFold.instructions, tmpRows, 0, '0');

		renderRows.current = tmpRows;
		const longestRowLen = Math.max(...tmpRows.map(arr => arr.length));
		setContStyle(
			Object.assign({}, contStyle, {
				height: HIER_PX_SIZE * longestRowLen + 14,
				width: cardStyle.width
			})
		);
	};

	const jumpToEnd = () => setFoldState({ stepIdx: foldState.maxSteps - 1 });

	const getDescForNode = (stepIdx) => {
		const step = stepArray[foldState.stepIdx + 1]
		const path = step[0].split(",").slice(1)
		let node = getHierNode(initFold.instructions, path);
		console.log("[getDescForNode]", stepArray, foldState.stepIdx, step, path, node);
		return node.desc;
	}

	// ---------
	// LIFECYCLE
	// ---------
	const cardStyle = useMemo(calcCardPos, [window.innerWidth, window.innerHeight, layoutState.expandHierarchy]);

	const buttonClasses = useMemo(
		() => ({
			root: classes.fold_controls_button,
			label: classes.fold_controls_button_label
		}),
		[]
	);

	const stepArray = useMemo(buildStepArray, [
		!initFold || !initFold.instructions,
		layoutState.currentFold,
		foldState.selectedLevel
	]);

	// Rerender whenever the page resizes
	useEffect(() => {
		window.addEventListener('resize', triggerRerender);
	}, []);

	useEffect(() => refreshRenderRows(maxLevel), [foldState.selectedLevel, foldLastUpdated, foldState.stepIdx]);

	// console.log('[InstructionalHierarchy]', renderRows.current);

	const ctrlCardLeftPx = `${435 + parseInt(cardStyle.width) + 10}px`;

	return (
		<React.Fragment>
			{/* The card contains the timeline, which contains most actions here */}
			<div className={classes.hier_card} style={cardStyle} ref={cardRef}>
				{/* The timeline */}
				<div className={classes.hier_container} style={contStyle}>
					{initFold &&
						renderRows.current.reduce((acc, row, idx) => {
							if (idx !== 0) {
								acc.push(<div className={classes.hier_node_container}>{row}</div>);
							}
							return acc;
						}, [])}
					<div className={classes.hier_node_anchor} onClick={jumpToEnd}>
						<div
							className={`${classes.hier_node} ${classes.hier_node_bookend}`}
						/>
					</div>
				</div>

				{/* The "current Time" line */}
			</div>

			{/* Text box shows details on the current step */}
			{initFold && initFold.instructions && (
				<Card className={classes.hier_desc_card} style={{left: ctrlCardLeftPx}}> 
					<Typography className={classes.modelCard_title} variant="h5" component="h2"> Current Step </Typography>
					<Typography>
						{(foldState.stepIdx < foldState.maxSteps - 1) ?
								getDescForNode(foldState.stepIdx) :
								// "text" :
								"Congratulations - your model is complete!"
						}
					</Typography>
				</Card>
			)}

			<div className={classes.hier_controls} style={{left: ctrlCardLeftPx}}>
				<Fab
					classes={buttonClasses}
					onClick={() => changeStep(-1)}
					disabled={foldState.stepIdx < 0}
					color="primary"
					size="large"
				>
					<SkipPrevious className={classes.fold_controls_button_icon} />
				</Fab>
				<Fab
					classes={buttonClasses}
					onClick={() => changeStep(1)}
					disabled={foldState.stepIdx >= foldState.maxSteps - 1}
					color="primary"
					size="large"
				>
					<SkipNext className={classes.fold_controls_button_icon} />
				</Fab>
			</div>

			{/* Annotations provide additional details on timeline items */}
		</React.Fragment>
	);
	// 			<Fab aria-label="expand instructions" className={classes.hier_expandCtrl} onClick={handleExpandClick} color="secondary" size="small">
	// 				{layoutState.expandHierarchy ? <ExpandLess /> : <ExpandMore />}
	// 			</Fab>
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
