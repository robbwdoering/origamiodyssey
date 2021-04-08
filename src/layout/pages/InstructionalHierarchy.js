/**
 * FILENAME: InstructionalHierarchy.js
 *
 * DESCRIPTION: These are piecemeal controls for the fold state.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';

import { SwipeableDrawer, Tooltip, Fab, ButtonGroup, List, Divider, ListItem, Card } from '@material-ui/core';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import SkipNext from '@material-ui/icons/SkipNext';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

import useStyles from './../../style/theme';
import { Folds } from './../../infra/constants';
import { setFoldState, setLayoutState } from './../../infra/actions';
import { collectStepsForLevel, calcMaxLevel, printPath } from './../../infra/utils';

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

	const buildStepArray = () => collectStepsForLevel(initFold, foldState.selectedLevel, foldState.usingDefaults);

	const renderNode = (inst, renderRows, levelIdx, path, stepIdx, belowDefault) => {
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
		let retStepIdx = isSelectedLevel ? stepIdx : stepIdx + 1;

		const style = {};

		// Base case: This is a leaf node
		if (isLeaf) {
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
			[height, children] = inst.children.reduce(
				(acc, child, childIdx) => {
					const [childWidth, childStepIdx] = renderNode(
						child,
						renderRows,
						levelIdx + 1,
						`${path},${childIdx}`,
						retStepIdx,
						belowDefault || isDefaultNode
					);
					retStepIdx = childStepIdx;
					acc[0] += childWidth;
					return acc;
				},
				[0, []]
			);

			style.flexGrow = height;
		}

		let type = 'default';

		if (stepArray.findIndex(step => path === step) === stepIdx) {
			// These nodes are part of the current step array
			type = 'active';
		} else if (isSelectedLevel || (foldState.selectedLevel > levelIdx && isLeaf && !belowDefault)) {
			// These nodes are part of the current step array
			type = 'inUse';
		}

		const pxHeight = HIER_PX_SIZE * style.flexGrow - 4;

		console.log('[renderNode]', levelIdx, path, stepIdx, foldState.stepIdx, type, isSelectedLevel);
		renderRows[levelIdx].push(
			<Tooltip
				title={inst.desc}
				placement="bottom-start"
				classes={{ popper: classes.hier_node_tooltip }}
				key={path}
			>
				<div className={`${classes.hier_node_anchor}`} style={style}>
					<div
						className={`${classes.hier_node} ${classes['hier_node__' + type]}`}
						style={{ height: pxHeight }}
					/>
				</div>
			</Tooltip>
		);

		return [height, retStepIdx];
	};

	const refreshRenderRows = cardStyle => {
		if (!initFold) {
			return;
		}

		let tmpRows = [];
		for (let i = 0; i < maxLevel; i++) {
			tmpRows.push([]);
		}

		renderNode(initFold.instructions, tmpRows, 0, '0', 0);

		renderRows.current = tmpRows;
		const longestRowLen = Math.max(...tmpRows.map(arr => arr.length));
		setContStyle(
			Object.assign({}, contStyle, {
				height: HIER_PX_SIZE * longestRowLen + 14,
				width: cardStyle.width
			})
		);
	};

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

	console.log('[InstructionalHierarchy]', renderRows.current);

	return (
		<React.Fragment>
			{/* The card contains the timeline, which contains most actions here */}
			<Card className={classes.hier_card} style={cardStyle} ref={cardRef}>
				{/* The timeline */}
				<div className={classes.hier_container} style={contStyle}>
					{initFold &&
						renderRows.current.reduce((acc, row, idx) => {
							if (idx !== 0) {
								acc.push(<div className={classes.hier_node_container}>{row}</div>);
							}
							return acc;
						}, [])}
				</div>

				{/* The "current Time" line */}
			</Card>

			{/* Text box shows details on the current step */}

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
