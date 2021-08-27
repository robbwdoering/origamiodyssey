/**
 * FILENAME: Timer.js
 *
 * DESCRIPTION: This component shows a simple timer that records to redux the amount of time taken to complete a set of instructions. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';

import {
	ButtonGroup,
	Divider,
	Typography,
	CardMedia,
	CardActionArea,
	CardActions,
	CardContent,
	Button,
	Grid,
	Fab,
	Card,
	Chip,
	Snackbar,
	Paper,
	Tooltip
} from '@material-ui/core';
import MuiAlert from "@material-ui/lab/Alert";
import FilterList from '@material-ui/icons/FilterList';
import Clear from '@material-ui/icons/Clear';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import Done from '@material-ui/icons/Done';

import useStyles from './../style/theme';
import { Folds, Pages, Tags, TagCategories, LikertTitles } from './../infra/constants';
import { setLayoutState, setFoldState, addHistoryEntry } from './../infra/actions';
import { timerPosixToString } from './../infra/utils';

/**
 * A timer that will re-rerender every second minimum.
 */
export const Timer = props => {
	const {
		placeholderRef,
		isActive,
		isHidden,
		layoutState,
		setLayoutState,
		foldState,
		setFoldState,
		userState,
		addHistoryEntry
	} = props;
	const [curHash, setHash] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [startPosix, setStartPosix] = useState(-1);
	const [workerId, setWorkerId] = useState(-1);
	const [hasInitialized, setHasInitialized] = useState(false);
	const [hasFinished, setHasFinished] = useState(false);
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [showLikertAssess, setShowLikertAssess] = useState(false);
	const [lastLikert, setLastLikert] = useState(-1);
	const classes = useStyles();
	const style = useRef({});

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	const toggleTimer = () => {
		if (isPlaying && workerId !== -1) {
			setFoldState({
				lastRecordedTimer: foldState.lastRecordedTimer + (Date.now() - startPosix)
			});

			clearInterval(workerId);
			setWorkerId(-1);
			setStartPosix(-1);
		} else if (!isPlaying && workerId === -1){
			setWorkerId(setInterval(triggerRerender, 1000))
			setStartPosix(Date.now());
		}

		setIsPlaying(cur => !cur);
	};

	/**
	 * Reset the state that backs the value of the timer. Does not affect the running state;
	 * a running timer that is reset will immediately start counting from 0. 
	 */
	const resetTimer = () => {
		// Erase any record of the previous run - it is not saved anywhere
		setFoldState({ lastRecordedTimer: 0 });

		// Start running immediately if it was already running
		setStartPosix(isPlaying ? Date.now()  : -1);

		// Don't update the worker - if it's running, let it continue running
	};

	const resetAllState = () => {
		setIsPlaying(false);
		setHasInitialized(false);
		setHasFinished(false);
		setStartPosix(-1);

		setFoldState({lastRecordedTimer: 0});
	};

	const handleRecordQuality = () => {
		setShowLikertAssess(true);
	};

	const handleModelSelect = () => {
		closeSnackbar();
		setLayoutState({
			page: Pages.ModelSelect,
			curFold: null
		});

		// Reset fold state
		setFoldState(null);
	};

	const handleFoldAnother = () => {
		closeSnackbar();
		resetAllState();

		// Reset fold state
		setFoldState({
			stepIdx: -1	,
			repeatRoot: -1,
			repeatRange: null
		});
	}

	const handleSubmitLikert = () => {
		setShowLikertAssess(false);
	};

	const genLikertScale = () => {
		let ret = [];
		for (let i = 0; i < 5; i++) {
			const isActive = i <= lastLikert;
			ret.push(
				<Tooltip
					title={LikertTitles[i]}
					placement="bottom-start"
					classes={{ popper: classes.hier_node_tooltip }}
					key={`likert-tt-${i}`}
				>
					<div key={i} className={classes.likert_icon_container} onClick={() => setLastLikert(cur => cur === i ? -1 : i)}>
						{isActive ? <Star className={classes.likert_icon}/> : <StarBorder className={classes.likert_icon}/>}
					</div>
				</Tooltip>
			);
		}

		return (
			<ButtonGroup variant="text">
				{ret}
				<Button onClick={handleSubmitLikert} disabled={lastLikert === -1}>
					Submit	
				</Button>
			</ButtonGroup>
		);
	};

	const closeSnackbar = () => {
		// console.log("[closeSnackbar]", hasFinished, showSnackbar, lastLikert, layoutState.curFold);
		if (!showSnackbar) {
			return;
		}

		setShowSnackbar(false);

		// If details weren't already sent, send them now
		if (!hasFinished) {
			setHasFinished(true);	

			let newEntry = {
				foldKey: layoutState.curFold,
				time: Date.now(),
				quality: lastLikert !== -1 ? lastLikert : 3,
				timer: foldState.lastRecordedTimer
			};

			addHistoryEntry(newEntry);

			setFoldState({ lastRecordedTimer: 0 });
			setLastLikert(-1);
		}
	};

	// LIFECYCLE

	// Dynamically calculate the target size of the card
	style.current = {
		height: isActive ? '400px' : '180px',
		width: isActive ? '400px' : '200px',
		display: isHidden ? 'none' : undefined
	};

	if (placeholderRef && placeholderRef.current) {
		style.current.top = placeholderRef.current.offsetTop;
		style.current.left = placeholderRef.current.offsetLeft;
	}

	// Every time a new model is selected, the timer starts from scratch
	useEffect(resetAllState, [layoutState.curFold]);

	// Every time a step is advanced, check for completion
	useEffect(() => {
		// If this is a change to the last step, 
		if (foldState.stepIdx >= foldState.maxSteps - 1) {
			if (isPlaying) {
				toggleTimer();
			}

			setShowSnackbar(true);

			// Start the timer the first time the user changes steps
			// TODO - probably good feature, but system needs redesign
		}

		// Close the snackbar on unmount if it's open, which involves saving
		return closeSnackbar;
	}, [foldState.stepIdx]);

	let timerPosix = foldState.lastRecordedTimer;
	if (isPlaying) {
		timerPosix += Date.now() - startPosix;
	}

	// console.log("[Timer]", timerPosix, foldState.lastRecordedTimer, isPlaying);

	return (
		<React.Fragment>
			<div className={classes.fold_timer_container}>
				<ButtonGroup id="oo-timer-container">
					<Button
						className={`${classes.fold_timer} ${!isPlaying ? classes.fold_timer__paused : ''}`}
						color={isPlaying ? undefined : "primary"}
						onClick={toggleTimer}
					>
						{!isPlaying && <PlayArrow/>}
						{timerPosixToString(timerPosix)}
					</Button>
					<Button className={classes.fold_timer_control} onClick={resetTimer} disabled={!isPlaying && !foldState.lastRecordedTimer}>
						<Clear />	
					</Button>
				</ButtonGroup>
			</div>
			<Snackbar className={classes.fold_timer_snackbar} open={showSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<Paper elevation={5}>
				{showLikertAssess ? (
					<Grid className={classes.fold_timer_grid} container>
						<Grid item xs={12}>
							<Typography variant="h4" component="h4">
								Please rate the quality of this result...	
							</Typography>
						</Grid>
						<Grid item xs={12}>
							{genLikertScale()}
						</Grid>
					</Grid>
				) : (
					<Grid className={classes.fold_timer_grid} container>
						<Grid item xs={10}>
							<Typography  variant="h4" component="h4">
								Model complete
							</Typography>
							<Button classes={{root: classes.fold_timer_snackbar_close}} onClick={closeSnackbar}>
								<Clear />
							</Button>
						</Grid>
						{userState.showLikertAssess && (
							<Grid item xs={12} md={4}>
								<Button onClick={handleRecordQuality} disabled={lastLikert !== -1}>
									{lastLikert !== -1 && (
										<Done className={classes.fold_timer_done_icon} />
									)}
									Record Quality
								</Button>
							</Grid>
						)}
						<Grid item xs={12} md={4}>
							<Button onClick={handleFoldAnother}>
								Fold Another	
							</Button>
						</Grid>
						<Grid item xs={12} md={4}>
							<Button onClick={handleModelSelect}>
								Find Another Model	
							</Button>
						</Grid>
					</Grid>
				)}
				</Paper>
			</Snackbar>
			</React.Fragment>
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

export default connect(mapStateToProps, { setLayoutState, setFoldState, addHistoryEntry })(Timer);
