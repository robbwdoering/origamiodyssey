/**
 * FILENAME: User.js
 *
 * DESCRIPTION: This page allows the user to browser through cards, read details on models, and select one to fold.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';

import {
	SwipeableDrawer,
	Menu,
	ButtonGroup,
	Button,
	Select,
	Input,
	MenuItem,
	List,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	ListItem,
	Card,
	Grid,
	Typography,
	Paper
} from '@material-ui/core';
import { ToggleButton } from '@material-ui/lab';
import Remove from '@material-ui/icons/Remove';
import ExitToApp from '@material-ui/icons/ExitToApp';

import { useAuth0 } from '@auth0/auth0-react';

import useStyles from './../../style/theme';
import { Folds, Pages } from './../../infra/constants';
import { setUserState, setLayoutState } from './../../infra/actions';
// const AnimatedCard = animated(Card);

export const User = props => {
	const { userState, setUserState, layoutState, setLayoutState } = props;
	const classes = useStyles();
	const { user, loginWithRedirect, isLoading, logout, isAuthenticated } = useAuth0();
	const [addModelAnchor, setAddModelAnchor] = useState();

	// ----------
	// STATE INIT
	// ----------

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------

	const ControlRow = ({ text, children, ...rest }) => (
		<Grid item className={classes.editor_row} {...rest}>
			{/* Title */}

			<Typography className={classes.modelCard_label} variant="body2" color="textSecondary" component="h4">
				{text}
			</Typography>
			<Divider />

			{children}
		</Grid>
	);

	const handleUserFormChange = (name, value) => {
		setUserState({ [name]: value });
	};

	const handleModelSelection = foldKey => {
		setAddModelAnchor(null);

		// Exit early if this is already in the list
		if (userState.modelList.find(entry => entry.foldKey === foldKey)) {
			return;
		}

		let newModelListEntry = {
			foldKey: foldKey,
			interval: 0,
			repetition: 0,
			efactor: 2.5
		};

		const newModelList = [...userState.modelList, newModelListEntry];
		setUserState({ modelList: newModelList });
	};

	const handleOpenFold = foldKey => {
		setLayoutState({
			page: Pages.Fold,
			curFold: foldKey
		});
	};

	const handleRemoveFold = foldKey => {
		const idx = userState.modelList.findIndex(entry => entry.foldKey === foldKey);
		console.log("[handleRemoveFold]", idx)
		// Exit early if this isn't already in the list
		if (idx === -1) {
			return;
		}

		let newArr = [...userState.modelList];
		newArr.splice(idx, 1);

		setUserState({ modelList: newArr });
	};

	// ---------
	// LIFECYCLE
	// ---------

	if (isLoading) {
		return (
			<Typography className={classes.modelCard_label} variant="h3" color="textSecondary" component="h3">
				Loading...
			</Typography>
		);
	} else if (!isAuthenticated) {
		return (
			<Paper className={classes.user_login_prompt} elevation={3}>
				<Typography className={classes.modelCard_label} variant="h3" color="textSecondary" component="h3">
					Login
				</Typography>

				<Typography variant="body" color="textSecondary" component="body">
					Please login to access user page features and preferences.
				</Typography>

				<Button onClick={() => loginWithRedirect()} color="primary">
					Login
				</Button>
			</Paper>
		);
	}

	console.log('[User]', user);
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab
	// TODO - history tab

	return (
		<Grid className={classes.user_container} container spacing={2}>
			{/* Profile Information */}
			<Grid item xs={6} md={4}>
				<Paper className={classes.user_profile} elevation={3}>
					<Typography className={classes.modelCard_label} variant="h3" color="textSecondary" component="h3">
						Profile
					</Typography>
					<Divider />
					<br />
					<Grid container>
						<ControlRow text="Email" xs={12} md={8}>
							<div> {user.email} </div>
						</ControlRow>
						<ControlRow text="Logout" xs={12} md={4}>
							<Button onClick={() => loginWithRedirect()} color="primary">
								Logout
							</Button>
						</ControlRow>
					</Grid>
				</Paper>
			</Grid>

			{/* Preferences */}
			<Grid item xs={6} md={8}>
				<Paper className={classes.user_pref} elevation={2}>
					<Typography className={classes.modelCard_label} variant="h3" color="textSecondary" component="h3">
						Preferences
					</Typography>
					<Divider />
					<br />
					<Grid container spacing={2}>
						<Grid item xs={6} md={4}>
							<ToggleButton
								value={userState.showEditor}
								selected={userState.showEditor}
								onChange={() => handleUserFormChange('showEditor', !userState.showEditor)}
							>
								Show Editor
							</ToggleButton>
						</Grid>
						<Grid item xs={6} md={8}>
							<Typography variant="body2" color="textSecondary" component="h4">
								Show special cards during instructions for controlling the animation, and identifying
								individual vertices and edges in the paper.
							</Typography>
						</Grid>

						<Grid item xs={6} md={4}>
							<ToggleButton
								value={userState.showTimerAssess}
								selected={userState.showTimerAssess}
								onChange={() => handleUserFormChange('showTimerAssess', !userState.showTimerAssess)}
							>
								Show Timer
							</ToggleButton>
						</Grid>
						<Grid item xs={6} md={8}>
							<Typography variant="body2" color="textSecondary" component="h4">
								Show a timer that allows you to track model folding speed over time. Turning this on
								allows the assistant to identify your strengths and weakenesses better.
							</Typography>
						</Grid>

						<Grid item xs={6} md={4}>
							<ToggleButton
								value={userState.showLikertAssess}
								selected={userState.showLikertAssess}
								onChange={() => handleUserFormChange('showLikertAssess', !userState.showLikertAssess)}
							>
								Show Quality Prompts
							</ToggleButton>
						</Grid>
						<Grid item xs={6} md={8}>
							<Typography variant="body2" color="textSecondary" component="h4">
								Show a prompt after completing a model, allowing you to track quality over time. Turning
								this on allows the assistant to identify your strengths and weakenesses better.
							</Typography>
						</Grid>
					</Grid>
				</Paper>
			</Grid>

			{/* Assistant */}
			<Grid item xs={12}>
				<Paper className={classes.user_assistant} elevation={2}>
					<Typography className={classes.modelCard_label} variant="h3" color="textSecondary" component="h3">
						Assistant
					</Typography>

					<Divider />
					<br />

					<Button
						className={classes.user_add_model_button}
						onClick={event => setAddModelAnchor(event.currentTarget)}
					>
						Add Model To Plan
					</Button>
					<Menu
						name="modelAdd"
						input={<Input id="Menu-multiple-chip" />}
						className={classes.user_add_model_menu}
						anchorEl={addModelAnchor}
						open={Boolean(addModelAnchor)}
						onClose={() => setAddModelAnchor(null)}
					>
						{Object.keys(Folds)
							.filter(foldKey => !userState.modelList.find(entry => entry.foldKey === foldKey))
							.map(foldKey => (
								<MenuItem key={foldKey} value={foldKey} onClick={() => handleModelSelection(foldKey)}>
									{Folds[foldKey].name}
								</MenuItem>
							))}
					</Menu>

					<TableContainer>
						<Table>
							<TableHead className={classes.user_models_header}>
								<TableRow>
									<TableCell className={classes.slimCol}> Controls </TableCell>
									<TableCell> Model Name </TableCell>
									<TableCell className={classes.slimCol}> Interval </TableCell>
									<TableCell className={classes.slimCol}> Repetition </TableCell>
									<TableCell className={classes.slimCol}> Difficulty </TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{userState.modelList.map(entry => {
									const foldObj = Folds[entry.foldKey];
									return (
										<TableRow>
											<TableCell className={classes.slimCol}>
												<ButtonGroup className={classes.user_row_controls} color="primary" variant="icon" >
													<Button onClick={() => handleRemoveFold(entry.foldKey)} title="Remove this model from the schedule"> <Remove /> </Button>
													<Button onClick={() => handleOpenFold(entry.foldKey)} title="Start this fold"> <ExitToApp /> </Button>
												</ButtonGroup>
											</TableCell>
											<TableCell> {foldObj.name} </TableCell>
											<TableCell className={classes.slimCol}> {entry.interval} </TableCell>
											<TableCell className={classes.slimCol}> {entry.repetition} </TableCell>
											<TableCell className={classes.slimCol}> {entry.efactor} </TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</Grid>
		</Grid>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		userState: state.appReducer.userState,
		userStateHash: state.appReducer.userState.hash,
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash
	};
};

export default connect(mapStateToProps, { setUserState, setLayoutState })(User);
