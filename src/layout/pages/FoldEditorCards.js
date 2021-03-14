/**
 * FILENAME: FoldEditorCards.js 
 *
 * DESCRIPTION: These cards are shown on either side of the model, and allow realtime editing of .fold files. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config }  from 'react-spring';
import { JsonEditor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';

import { Button, Typography, ButtonGroup, Grid, List, Divider, ListItem, Card } from '@material-ui/core';
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import SkipNext from "@material-ui/icons/SkipNext";

import useStyles from "./../../style/theme";
import { Folds } from "./../../infra/constants";
import { setFoldState } from "./../../infra/actions";
// const AnimatedCard = animated(Card);

export const FoldEditorCards = props => {
	const { initFold, windowHeight, foldState, foldStateHash, setFoldState } = props;

	// ----------
	// STATE INIT 
	// ----------
	const classes = useStyles();
	const [curHash, setHash] = useState(0);
	const localFold = useRef();

	// ----------------
	// MEMBER FUNCTIONS 
	// ----------------
	const calcControlsPosition = () => {
		return (window.innerWidth - 128) / 2;
	};

	const CardLabel = ({ text }) => (
		<React.Fragment>
			<Typography className={classes.modelCard_label} variant="body2" color="textSecondary" component="h4">
				{text}
			</Typography>
			<Divider />
		</React.Fragment>
	);

	const ControlRow = ({ name, text, children }) => (
		<div className={classes.editor_row}>
			{/* Title */}
			<CardLabel text={name} />
			{text && (
				<Typography className={classes.modelCard_bodyText} variant="body2" color="textSecondary" component="p">
					<strong>{text}</strong>
				</Typography>
			)}

			{children}
		</div>
	);

	const resetLocalFold = () => {
		console.log("[resetLocalFold]", initFold)
		localFold.current = JSON.parse(JSON.stringify(initFold));
	};

	const handleFoldChange = (e) => {
		Object.assign(localFold.current, e);
	};

	// ---------
	// LIFECYCLE
	// ---------
	const buttonClasses = useMemo(() => ({
		root: classes.fold_controls_button,
		label: classes.fold_controls_button_label
	}), []);

	useEffect(resetLocalFold, [initFold])

	const ctrlLeft = useMemo(calcControlsPosition, [window.innerWidth]);

    return (
    	<React.Fragment>
	    	{/* Details on the fold state */}
			<Card className={classes.editorState} >
				<Typography className={classes.editor_cardTitle} variant="h4" color="textSecondary" component="h4">
					Fold State
				</Typography>
		    	<Grid container>
		    		<Grid item xs={6}> <ControlRow name="Selected Level" text={foldState.selectedLevel} /> </Grid>
		    		<Grid item xs={6}> <ControlRow name="Step Index" text={`${foldState.stepIndex}/${foldState.maxSteps - 1}`} /> </Grid>
				</Grid>
    		</Card>

	    	{/* Details on the current instruction */}
			<Card className={classes.editorDetails} >
				<Typography className={classes.editor_cardTitle} variant="h4" color="textSecondary" component="h4">
					Instruction Details
				</Typography>
				<ControlRow name="Selected Level" text="" />
				<ControlRow name="Step Index" text="" />
				<ControlRow name="Num Vertices" text="" />
    		</Card>

	    	{/* Entry box for direct JSON manipulation */}
			<Card className={classes.editorEntry} >
				<Typography className={classes.editor_cardTitle} variant="h4" color="textSecondary" component="h4">
					<code>.fold</code> file
				</Typography>
				<JsonEditor
					value={{
						faces_vertices: initFold.faces_vertices,
						vertices_coords: initFold.vertices_coords,
						edges_vertices: initFold.edges_vertices,
						instructions: initFold.instructions,
					}}
					onChange={handleFoldChange}
					htmlElementProps={{class: classes.editor_jsonTextArea}}
					allowedModes={["tree", "form"]}
					navigationBar={false}
					history={true}
				/>
    		</Card>
    	</React.Fragment>
    );
};

export const mapStateToProps = (state, props) => {
	return {
		foldState: state.appReducer.foldState,
		foldStateHash: state.appReducer.foldState.hash
	};
};

export default connect(mapStateToProps, { setFoldState })(FoldEditorCards);
