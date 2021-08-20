/**
 * FILENAME: FoldEditorCards.js
 *
 * DESCRIPTION: These cards are shown on either side of the model, and allow realtime editing of .fold files.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';
import { JsonEditor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import Downloader from 'js-file-downloader';

import { Button, Typography, ButtonGroup, Chip, Input, Select, MenuItem, Grid, List, Divider, ListItem, Card } from '@material-ui/core';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import SkipNext from '@material-ui/icons/SkipNext';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { ToggleButton } from '@material-ui/lab';

import useStyles from './../style/theme';
import { Folds } from './../infra/constants';
import { setFoldState, setEditorState } from './../infra/actions';

export const FoldEditorCards = props => {
	const {
		curFold,
		initFold,
		foldLastUpdated,
		windowHeight,
		foldOverrideCallback,
		foldState,
		foldStateHash,
		setFoldState,
		editorState,
		editorStateHash,
		setEditorState
	} = props;

	// ----------
	// STATE INIT
	// ----------
	const classes = useStyles();
	const [curHash, setHash] = useState(0);
	const [expandControls, setExpandControls] = useState(false);
	const localFold = useRef();

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------
	const calcControlsPosition = () => {
		return (window.innerWidth - 128) / 2;
	};

	const CardLabel = ({ text }) => (
		<React.Fragment>
			<Typography className={classes.modelCard_label} variant='body2' color='textSecondary' component='h4'>
				{text}
			</Typography>
			<Divider />
		</React.Fragment>
	);

	const ControlRow = ({ name, text, width, children }) => (
		<Grid item xs={width || 12} className={classes.editor_row}>
			{/* Title */}
			<CardLabel text={name} />
			{text !== undefined && (
				<Typography className={classes.editor_bodyText} variant='body2' color='textSecondary' component='p'>
					<strong>{text}</strong>
				</Typography>
			)}

			{children}
		</Grid>
	);

	const resetLocalFold = () => {
		// console.log('[resetLocalFold]', initFold);
		localFold.current = JSON.parse(JSON.stringify(initFold));
	};

	const handleFoldChange = e => {
		Object.assign(localFold.current, e);
	};

	const handleSaveClick = () => {
		if (!localFold.current || !curFold) {
			console.error("Couldn't save file; no current value.");
			return;
		}

		foldOverrideCallback(localFold.current);
	};

	const handleExportClick = async () => {
		if (!localFold.current || !curFold) {
			console.error("Couldn't export file; no current value.");
			return;
		}

		let fileDownloadUrl = `data:application/json,${encodeURIComponent(JSON.stringify(localFold.current, null, 2))}`;
		// fileDownloadUrl = URL.createObjectURL(fileDownloadUrl)

		new Downloader({
			url: fileDownloadUrl,
			filename: `${curFold}.json`
		}).then(() => {
			console.log('finished download.');
		});
	};

	const handleEditorFormChange = (field, value) => {
		setEditorState({ [field]: value });
	};

	const handleSelectionChange = event => {
		// console.log('GOT EVENT! ', event.target);
		const field = event.target.name;
		const value = event.target.value;

		setEditorState({ [field]: value });
	};

	// ---------
	// LIFECYCLE
	// ---------
	const buttonClasses = useMemo(
		() => ({
			root: classes.fold_controls_button,
			label: classes.fold_controls_button_label
		}),
		[]
	);

	useEffect(resetLocalFold, [initFold]);

	const ctrlLeft = useMemo(calcControlsPosition, [window.innerWidth]);

	// If we don't have any fold file loaded yet, don't show these
	if (!initFold) {
		return <div />;
	}

	return (
		<React.Fragment>
			{/* Details on the fold state */}
			<Card className={classes.editorState}>
				<Typography className={classes.editor_cardTitle} variant='h4' color='textSecondary' component='h4'>
					Fold State
				</Typography>
				<Grid container>
					<ControlRow name='Step Index' text={`${foldState.stepIdx + 2}/${foldState.maxSteps + 1}`} width={6} />
				</Grid>
			</Card>

			{/* Details on the current instruction */}
			<Card className={classes.editorDetails} style={{ height: expandControls ? '60%' : '60px' }}>
				<Typography className={classes.editor_cardTitle} variant='h4' color='textSecondary' component='h4'>
					Editor Controls
				</Typography>
				<Button className={classes.editor_details_expand} onClick={() => setExpandControls(cur => !cur)}>
					{expandControls ? <ExpandMore /> : <ExpandLess />}
				</Button>
				{expandControls && (
					<Grid container>
						<ControlRow name='Highlighted Edges'>
							<Select
								name='edgeHighlights'
								multiple
								value={editorState.edgeHighlights}
								onChange={handleSelectionChange}
								input={<Input id='select-multiple-chip' />}
								renderValue={selected => (
									<div className={classes.chips}>
										{selected.map(idx => (
											<Chip key={idx} label={initFold.edges_vertices[idx].toString()} className={classes.chip} />
										))}
									</div>
								)}
								className={classes.editor_select}
								// MenuProps={MenuProps}
							>
								{initFold.edges_vertices.map((edge, index) => {
									const name = edge.toString();
									return (
										<MenuItem key={name} value={index}>
											{index}: {name}
										</MenuItem>
									);
								})}
							</Select>
						</ControlRow>
						<ControlRow name='vertexHighlights'>
							<Select
								name='vertexHighlights'
								multiple
								value={editorState.vertexHighlights}
								onChange={handleSelectionChange}
								input={<Input id='select-multiple-chip' />}
								renderValue={selected => (
									<div className={classes.chips}>
										{selected.map(idx => (
											<Chip key={idx} label={`${idx}: ${initFold.vertices_coords[idx].toString()}`} className={classes.chip} />
										))}
									</div>
								)}
								className={classes.editor_select}
								// MenuProps={MenuProps}
							>
								{initFold.vertices_coords.map((coords, index) => {
									const name = coords.toString();
									return (
										<MenuItem key={name} value={index}>
											{index}: {name}
										</MenuItem>
									);
								})}
							</Select>
						</ControlRow>
						<ControlRow name='faceHighlights'>
							<Select
								name='faceHighlights'
								multiple
								value={editorState.faceHighlights}
								onChange={handleSelectionChange}
								input={<Input id='select-multiple-chip' />}
								renderValue={selected => (
									<div className={classes.chips}>
										{selected.map(idx => (
											<Chip key={idx} label={`${idx}: ${initFold.faces_vertices[idx].toString()}`} className={classes.chip} />
										))}
									</div>
								)}
								className={classes.editor_select}
								// MenuProps={MenuProps}
							>
								{initFold.faces_vertices.map((face, index) => {
									const name = face.toString();
									return (
										<MenuItem key={name} value={index}>
											{name}
										</MenuItem>
									);
								})}
							</Select>
						</ControlRow>
						<ControlRow name='Show Edges' width={4}>
							<ToggleButton selected={editorState.showEdges} onChange={() => handleEditorFormChange('showEdges', !editorState.showEdges)} />
						</ControlRow>
						<ControlRow name='Show Vertices' width={4}>
							<ToggleButton
								selected={editorState.showVertices}
								onChange={() => handleEditorFormChange('showVertices', !editorState.showVertices)}
							/>
						</ControlRow>
						<ControlRow name='Show Faces' width={4}>
							<ToggleButton selected={editorState.showFaces} onChange={() => handleEditorFormChange('showFaces', !editorState.showFaces)} />
						</ControlRow>
						<ControlRow name='Show Tri' width={4}>
							<ToggleButton
								selected={editorState.showTriangulations}
								onChange={() => handleEditorFormChange('showTriangulations', !editorState.showTriangulations)}
							/>
						</ControlRow>
						<ControlRow name='Show Labels' width={4}>
							<ToggleButton selected={editorState.showLabels} onChange={() => handleEditorFormChange('showLabels', !editorState.showLabels)} />
						</ControlRow>
					</Grid>
				)}
			</Card>

			{/* Entry box for direct JSON manipulation */}
			<Card className={classes.editorEntry}>
				<Typography className={classes.editor_cardTitle} variant='h4' color='textSecondary' component='h4'>
					<code>.fold</code> file
				</Typography>
				<ButtonGroup className={classes.editor_floatAction} color='primary' variant='text' size='large'>
					<Button onClick={handleSaveClick}> Local Save </Button>
					<Button onClick={handleExportClick}> Export To Disk </Button>
				</ButtonGroup>
				<JsonEditor
					value={{
						faces_vertices: initFold.faces_vertices,
						vertices_coords: initFold.vertices_coords,
						edges_vertices: initFold.edges_vertices,
						instructions: initFold.instructions
					}}
					onChange={handleFoldChange}
					htmlElementProps={{ class: classes.editor_jsonTextArea }}
					allowedModes={['tree', 'form']}
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
		foldStateHash: state.appReducer.foldState.hash,
		editorState: state.appReducer.editorState,
		editorStateHash: state.appReducer.editorState.hash
	};
};

export default connect(mapStateToProps, { setFoldState, setEditorState })(FoldEditorCards);
