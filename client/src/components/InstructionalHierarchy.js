/**
 * FILENAME: InstructionalHierarchy.js
 *
 * DESCRIPTION: These are piecemeal controls for the fold state.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';
import SquareLoader from 'react-spinners/SquareLoader';

import {
	SwipeableDrawer,
	Tooltip,
	Typography,
	Fab,
	ButtonGroup,
	List,
	Divider,
	ListItem,
	Card
} from '@material-ui/core';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import SkipNext from '@material-ui/icons/SkipNext';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

import useStyles from './../style/theme';
import { Folds } from './../infra/constants';
import { setFoldState, setLayoutState, setUserState } from './../infra/actions';
import TimerContainer from './Timer';
import { collectStepsForLevel, calcMaxLevel, printPath, findInUseFamilyNode, getHierNode } from './../infra/utils';

const HIER_PX_SIZE = 20;

export const InstructionalHierarchy = props => {
	const {
		initFold,
		foldLastUpdated,
		foldState,
		setFoldState,
		layoutState,
		setLayoutState,
		userState,
		setUserState
	} = props;

	// ----------
	// STATE INIT
	// ----------

	const [contStyle, setContStyle] = useState({});
	const classes = useStyles();
	const cardRef = useRef();
	const activeNodeRef = useRef();
	const renderRows = useRef([]);
	const [curHash, setHash] = useState(0);
	const [looperDirection, setLooperDirection] = useState(-1);
	const [looperWorkerId, setLooperWorkerId] = useState(-1);
	const [looperHash, setLooperHash] = useState(0);
	const [finishedInit, setFinishedInit] = useState(false);

	const maxLevel = useMemo(() => calcMaxLevel(initFold && initFold.instructions), [foldLastUpdated]);

	const trackTop = window.innerHeight - 264 - HIER_PX_SIZE * foldState.stepIdx + 'px';

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------

	/**
	 * Changes the current instructional sequential step, prompting animation through redux changes.
	 * @param delta The number of step indices to change by. Positive to go towards end of instructions, negative to go back
	 * @param isFromLooper true if this step change was done automatically
	 */
	const changeStep = (delta, isFromLooper) => {
		let newStepIndex = Math.min(Math.max(foldState.stepIdx + delta, -1), foldState.maxSteps);
		let newFoldState = {
			stepIdx: newStepIndex
		};

		if (!isFromLooper) {
			newFoldState.repeatRoot = -1;
			newFoldState.repeatRange = null;
			if (looperWorkerId !== -1) {
				clearInterval(looperWorkerId);
				setLooperWorkerId(-1);
			}
		}

		setFoldState(newFoldState);
	};

	/**
	 * Calculate how many "default", or 2D, steps come before this one, and get their lengths.
	 * This is useful since we know our index within the stepArray, but without information from this function,
	 * we would have no way of deriving the final height of the whole component.
	 * @param stepIdx count all the steps before this index
	 */
	const calcNumDefaultsBefore = stepIdx => {
		let total = 0;

		stepArray.some((elem, i) => {
			if (i > stepIdx) {
				return true;
			}

			// Only default items are 2D arrays
			if (Array.isArray(elem[1][0])) {
				// Add the number of leaf nodes here, minus one for the path at idx 0, and one for the spot taken by the root 2D array
				total += elem.length - 2;
			}
		});

		return total;
	};

	/**
	 * Calculate where the card appears based on the current step and the shape of the overall instructions.
	 * @return a CSS-in-JS styling object
	 */
	const calcCardPos = () => {
		// const right = window.innerWidth > 1200 ? ((window.innerWidth / 2) + 0 + 'px') : undefined;
		// const left = right ? undefined : 10;
		const width = (maxLevel - 1) * HIER_PX_SIZE + 14;

		// Left side is outside the center column if there's room, else just sticks to the left side
		const left = window.innerWidth < 1200 + width + 10 ? 0 : -width - 10;

		// Top updates every time the step changes
		const numDefaultsBefore = calcNumDefaultsBefore(foldState.stepIdx);
		const top = window.innerHeight - 296 - HIER_PX_SIZE * (foldState.stepIdx + 1 + numDefaultsBefore);
		let style = {
			// Don't show first column, and account for padding
			width: width + 'px',
			left: left + 'px',
			height: contStyle.height,
			top: top + 'px'
		};

		return style;
	};

	/**
	 * Rerender this component.
	 */
	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	/**
	 * Execute logic necessary when a user clicks one of the nodes, which usually will simply set the
	 * current step to whatever node was clicked, but can do other things if, e.g., they held shift to
	 * start a loop.
	 * @param event Event object from MUI
	 * @param path Unique string representing the node that was clicked
	 */
	const handleHierNodeClick = (event, path) => {
		const stepIdx = stepArray.findIndex(step => path === step[0]);
		let newFoldState = {};

		const [startUseIndex, endUseIndex] = findInUseFamilyNode(stepArray, path);

		if (!event.shiftKey) {
			// If no shift, just move to this node
			if (stepIdx !== -1) {
				// If it's in the stepArray, just set the index to that element
				newFoldState.stepIdx = stepIdx - 1;
			} else {
				// Else we need to find whatever in use index corresponds
				if (startUseIndex !== -1 && endUseIndex !== -1) {
					newFoldState.stepIdx = startUseIndex - 1;
				}
			}

			if (foldState.repeatRoot !== -1) {
				newFoldState.repeatRoot = -1;
				newFoldState.repeatRange = null;

				if (looperWorkerId !== -1) {
					clearInterval(looperWorkerId);
					setLooperWorkerId(-1);
				}
			}
		} else {
			// If shift held, then start or modify repeatRange
			if (foldState.repeatRoot !== -1) {
				// Modify existing range, replacing the second clicked index
				if (stepIdx !== -1) {
					newFoldState.repeatRange = [foldState.repeatRoot, stepIdx];
				} else if (startUseIndex <= foldState.repeatRoot && endUseIndex >= foldState.repeatRoot) {
					// Either clicked a descendant or ancestor of the root - basically undefined behavior
					newFoldState.repeatRange = [startUseIndex, endUseIndex];
				} else if (startUseIndex < foldState.repeatRoot) {
					// Clicked something before
					newFoldState.repeatRange = [foldState.repeatRoot, startUseIndex];
				} else {
					// Clicked something after
					newFoldState.repeatRange = [foldState.repeatRoot, endUseIndex];
				}
			} else {
				if (stepIdx !== -1) {
					// If this is the first shift click, we're starting at this location
					newFoldState.stepIdx = stepIdx - 1;

					newFoldState.repeatRoot = stepIdx;
					newFoldState.repeatRange = [stepIdx, stepIdx];
				} else {
					// If this is the first shift click, we're starting at this location
					newFoldState.stepIdx = startUseIndex - 1;

					newFoldState.repeatRoot = startUseIndex;
					newFoldState.repeatRange = [startUseIndex, endUseIndex];
				}
			}

			if (looperWorkerId === -1) {
				setLooperWorkerId(setInterval(looperWorker, 2500));
			}

			// Ensure the first element is always the first in index order
			newFoldState.repeatRange.sort();

			// Go to the start, and progress forward
			newFoldState.stepIdx = newFoldState.repeatRange[0] - 1;
			setLooperDirection(1);
		}

		setFoldState(newFoldState);
	};

	/**
	 * Wrapper for collectStepsForLevel using local vars.
	 * @returns the array of "actual"/"in-use" steps
	 */
	const buildStepArray = () => {
		return collectStepsForLevel(initFold, 0, foldState.usingDefaults);
	};

	/**
	 * Render one node in the hierarchy.
	 * NOTE: This doesn't return the node, but rather saves it to the renderRows object passed in.
	 * @param inst this particular instruction object
	 * @param renderRows output array of renderable objects
	 * @param levelIdx the index of the current hierarchy level
	 * @param path the path of this instructional node
	 * @param belowDefault true if we are "below" a default node, which requires special handling
	 * @return the height of the rendered row
	 */
	const renderNode = (inst, renderRows, levelIdx, path, belowDefault) => {
		// Error case - we're on a level deeper than the tree supports
		if (levelIdx > maxLevel) {
			return [1, stepIdx];
		}
		let height = 0;
		let children = [];
		const isDefaultNode = foldState.usingDefaults && inst.default;
		const isSelectedLevel = isDefaultNode || !inst.children.length;
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
		} else if (isSelectedLevel || (isLeaf && !belowDefault)) {
			// These nodes are part of the current step array
			type = 'inUse';
		}

		const pxHeight = HIER_PX_SIZE * style.flexGrow - 4;

		renderRows[levelIdx].push(
			<Tooltip
				title={inst.desc}
				placement="bottom-start"
				classes={{ popper: classes.hier_node_tooltip }}
				key={path}
			>
				<div
					key={`${path}-div`}
					className={`${classes.hier_node_anchor}`}
					ref={activeNodeRef}
					style={style}
					onClick={event => handleHierNodeClick(event, path)}
				>
					<div
						key={`${path}-div-div`}
						className={`${classes.hier_node} ${classes['hier_node__' + type]}`}
						style={{ height: pxHeight }}
					/>
				</div>
			</Tooltip>
		);

		return height;
	};

	/**
	 * Re-render all the rows.
	 * @param cardStyle the style object that describes the shape of the component
	 */
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
				height: HIER_PX_SIZE * longestRowLen,
				width: cardStyle.width
			})
		);
	};

	/**
	 * Set the current step to the last one, ending the instructions.
	 */
	const jumpToEnd = () => setFoldState({ stepIdx: foldState.maxSteps - 1 });

	/**
	 * Get the description for the current step.
	 * @param stepIdx the index of the current step
	 */
	const getDescForNode = stepIdx => {
		const step = stepArray[foldState.stepIdx + 1];
		const path = step[0].split(',').slice(1);
		let node = getHierNode(initFold.instructions, path);

		return node.desc;
	};

	/**
	 * Changes the looperHash, which runs updateLooper() via a lifecycle call.
	 */
	const looperWorker = () => {
		if (foldState.repeatRoot === -1 || !foldState.repeatRange) {
			console.log('[looperWorker] ERR - null arguments');
			return;
		}

		setLooperHash(curHash => curHash + 1);
	};

	/**
	 * Carry out one iteration of the looping behavior, either going one forward one step or jumping back to the start of the loop.
	 */
	const updateLooper = () => {
		if (foldState.repeatRoot === -1 || !foldState.repeatRange) {
			return;
		}

		const distFromStart = foldState.stepIdx - foldState.repeatRange[0];
		const distFromEnd = foldState.repeatRange[1] - foldState.stepIdx;

		// Switch direction to go back up
		let tmpDirection = looperDirection;

		if (tmpDirection === -1 && distFromStart === -1) {
			tmpDirection = 1;
			setLooperDirection(tmpDirection);
		} else if (tmpDirection === 1 && distFromEnd === 1) {
			tmpDirection = -1;
			setLooperDirection(tmpDirection);
		}

		changeStep(tmpDirection, true);
	};

	/**
	 * Render the looper indication, which is a series of boxex, one for each step already executed for this loop.
	 * @return a renderable object
	 */
	const renderLooperItems = () => {
		if (foldState.repeatRoot === -1 || !foldState.repeatRange) {
			return null;
		}

		let ret = [];
		for (let i = foldState.repeatRange[0]; i <= foldState.repeatRange[1]; i++) {
			ret.push(
				<div
					key={i}
					className={`${classes.hier_looper_item} ${
						i <= foldState.stepIdx + 1 ? classes.hier_looper_item__active : ''
					}`}
				/>
			);
		}

		return ret;
	};

	// ---------
	// LIFECYCLE
	// ---------

	// On mount build the button classes object
	const buttonClasses = useMemo(
		() => ({
			root: classes.fold_controls_button,
			label: classes.fold_controls_button_label
		}),
		[]
	);

	// Build a new "actual"/"in-use" step array whenever the instructions change
	const stepArray = useMemo(buildStepArray, [!initFold || !initFold.instructions, initFold && initFold.frame_title]);

	// Recalculate the shape of the card every render
	const cardStyle = calcCardPos();

	// Perform mount and unmount actions
	useEffect(() => {
		// Rerender whenever the page resizes
		window.addEventListener('resize', triggerRerender);

		// Unmount logic
		return () => {
			// Stop the looper worker if it's running
			if (looperWorkerId !== -1) {
				clearInterval(looperWorkerId);
			}
		};
	}, []);

	// Start actually rendering text after a second
	useEffect(() => setTimeout(() => setFinishedInit(true), 1000), []);

	// Rerender the data every time the step index changes (or the fold itself changes)
	useEffect(() => refreshRenderRows(maxLevel), [foldState.stepIdx, foldLastUpdated]);

	// Take another step in the looping behavior whenever asked to
	useEffect(updateLooper, [looperHash]);

	// Calculate all these every render
	const ctrlCardLeftPx = `${window.innerWidth / 2 + 256}px`;
	const curBodyWidth = Math.min(1200, window.innerWidth);
	const buttonSize = window.innerWidth > 440 ? Math.min(200, curBodyWidth * 0.15) : 95;
	const buttonIconClass =
		buttonSize < 100 ? classes.fold_controls_button_icon : classes.fold_controls_button_icon_large;
	const fabStyle = {
		width: buttonSize + 'px',
		height: buttonSize + 'px'
	};

	// Magic nums:
	// 1200 is max width of the center colun
	// 10 is common spacing
	// 32 is padding on center column
	const instCardMargin =
		window.innerWidth < 1200 + parseInt(cardStyle.width) + 10 ? parseInt(cardStyle.width) - 32 + 10 + 'px' : '0';

	return (
		<div key='hier-center-col' className={classes.centerColumn_flex}>
			{/* The card contains the timeline, which contains most actions here */}
			<div key='hier-card' className={classes.hier_card} style={cardStyle} ref={cardRef}>
				{/* The timeline */}
				<div key='hier-timeline' className={classes.hier_container} style={contStyle}>
					{initFold &&
						renderRows.current.reduce((acc, row, idx) => {
							if (idx !== 0) {
								acc.push(
									<div idx={idx} key={'oo-hcr-' + idx} className={classes.hier_node_container}>
										{row.map((elem, subIdx) => <div key={'oo-oo-hcr-' + subIdx}> {elem} </div>)}
									</div>
								);
							}
							return acc;
						}, [])}
					<div className={`${classes.hier_node} ${classes.hier_node_bookend}`} />
				</div>

				{/* The "current Time" line */}
			</div>

			{/* Text box shows details on the current step */}
			{initFold && initFold.instructions && (
				<div className={classes.hier_desc_container}>
					{foldState.repeatRoot !== -1 && (
						<div className={classes.hier_looper_rail} style={{ marginLeft: instCardMargin }}>
							<div className={classes.hier_looper_container}>{renderLooperItems()}</div>
						</div>
					)}
					<Card className={classes.hier_desc_card} style={{ marginLeft: instCardMargin }}>
						{finishedInit ? (
							<React.Fragment>
								<Typography className={classes.modelCard_title} variant="h5" component="h2">
									{' '}
									Current Step{' '}
								</Typography>
								<Typography>
									{foldState.stepIdx < foldState.maxSteps - 1
										? getDescForNode(foldState.stepIdx)
										: // "text" :
										  'Congratulations - your model is complete!'}
								</Typography>
							</React.Fragment>
						) : (
							<SquareLoader color="#e0e0e0" size={75} css="margin: 16px;" />
						)}
					</Card>
				</div>
			)}

			<div className={classes.fold_controls_button_container} id="oo-main-button-step-ctrls">
				<Fab
					classes={buttonClasses}
					onClick={() => changeStep(-1)}
					disabled={foldState.stepIdx < 0}
					style={fabStyle}
					color="primary"
					size="large"
				>
					<SkipPrevious className={buttonIconClass} />
				</Fab>
				<Fab
					classes={buttonClasses}
					onClick={() => changeStep(1)}
					disabled={foldState.stepIdx >= foldState.maxSteps - 1}
					style={fabStyle}
					color="primary"
					size="large"
				>
					<SkipNext className={buttonIconClass} />
				</Fab>
			</div>

			{userState.showTimerAssess && <TimerContainer />}
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash,
		foldState: state.appReducer.foldState,
		foldStateHash: state.appReducer.foldState.hash,
		userState: state.appReducer.userState,
		userStateHash: state.appReducer.userState.hash
	};
};

export default connect(mapStateToProps, { setFoldState, setLayoutState, setUserState })(InstructionalHierarchy);
