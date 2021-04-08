/**
 * FILENAME: Body.js
 *
 * DESCRIPTION: The main body of the app, where most instruction, navigation, and animation happens.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

import { SwipeableDrawer, Button, List, Divider, ListItem } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useCookies } from 'react-cookie';

import { Pages, Folds, initNavTree } from './../infra/constants';
import { setLayoutState, setFoldState, setEditorState } from './../infra/actions';
import Splash from './pages/Splash';
import ModelSelect from './pages/ModelSelect';
import FoldControls from './pages/FoldControls';
import FoldEditorCards from './pages/FoldEditorCards';
import User from './pages/User';
import InstructionalHierarchy from './pages/InstructionalHierarchy';
import Scene from './../anim/Scene';
import useStyles from './../style/theme';

export const Body = props => {
	const {
		layoutState,
		layoutStateHash,
		setLayoutState,
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
	const containerRef = useRef();
	const fold = useRef({});
	const [curHash, setHash] = useState(0);
	const [cookies, setCookies] = useCookies([]);

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------
	const renderPage = () => {
		const pageProps = {};

		switch (layoutState.page) {
			case Pages.Splash:
				return <Splash {...pageProps} />;
			case Pages.ModelSelect:
				return <ModelSelect {...pageProps} />;
			case Pages.User:
				return <User {...pageProps} />;
			case Pages.Fold:
			default:
				return null;
		}
	};

	const renderPiecemeal = () => {
		switch (layoutState.page) {
			case Pages.Fold:
				return (
					<React.Fragment>
						<FoldControls
							windowHeight={windowHeight}
							initFold={fold.current.json}
							foldLastUpdated={fold.current.lastUpdated}
						/>

						<InstructionalHierarchy
							windowHeight={windowHeight}
							initFold={fold.current.json}
							foldLastUpdated={fold.current.lastUpdated}
						/>

						{layoutState.showEditor && (
							<FoldEditorCards
								windowHeight={windowHeight}
								initFold={fold.current.json}
								curFold={layoutState.curFold}
								foldOverrideCallback={foldOverrideCallback}
								foldLastUpdated={fold.current.lastUpdated}
							/>
						)}
					</React.Fragment>
				);
			case Pages.Splash:
			case Pages.ModelSelect:
			case Pages.User:
			default:
				return null;
		}
	};

	const selectFold = () => {
		console.log('selectFold', layoutState, Folds);
		fold.current = {
			json:
				layoutState.curFold && Folds[layoutState.curFold]
					? JSON.parse(JSON.stringify(Folds[layoutState.curFold].json))
					: null,
			lastUpdated: Date.now()
		};

		triggerRerender();
	};

	const foldOverrideCallback = newFold => {
		console.log('[foldOverrideCallback] ', newFold);
		Object.assign(fold.current.json, newFold);

		// Reset fold state
		setFoldState(null);
	};

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	const saveStateToCookies = () => {
		const finalEditorState = Object.assign({}, editorState, { stepIndex: -1 });
		setCookies('origamiodyssey_state', { layoutState, foldState, editorState: finalEditorState }, { path: '/' });
	};

	const fetchStateFromCookies = () => {
		if (cookies.origamiodyssey_state) {
			console.log('Applying state from cookies.', cookies.origamiodyssey_state);
			setLayoutState(cookies.origamiodyssey_state.layoutState);
			setFoldState(cookies.origamiodyssey_state.foldState);
			setEditorState(cookies.origamiodyssey_state.editorState);
		} else {
			console.log('cannot apply cookies... :(', cookies);
		}
	};

	// ---------
	// LIFECYCLE
	// ---------
	// Rerender whenever the page resizes
	useEffect(() => {
		window.addEventListener('resize', triggerRerender);
		window.addEventListener('beforeunload', saveStateToCookies);

		fetchStateFromCookies();
	}, []);

	useEffect(() => {
		saveStateToCookies();
	}, [layoutState.hash, foldState.hash, editorState.hash]);

	// Get the actual JSON for whatever fold name is selected
	useEffect(selectFold, [layoutState.curFold]);

	// Calculate height of window-matching containers
	const windowHeight = useMemo(() => {
		// The scene always fills the window after accounting for the AppBar
		return window.innerHeight - 64;
	}, [curHash]);

	const page = useMemo(renderPage, [layoutState.page]);
	const piecemeal = useMemo(renderPiecemeal, [layoutState.page, windowHeight]);

	console.log('[body]', fold.current);

	return (
		<div className={classes.bodyContainer} ref={containerRef}>
			<div className={classes.sceneContainer} style={{ height: windowHeight + 'px' }}>
				<Scene
					paperSize={windowHeight}
					initFold={fold.current.json}
					foldLastUpdated={fold.current.lastUpdated}
				/>
			</div>
			{page && (
				<div className={classes.centerColumn} style={{ height: windowHeight + 'px' }}>
					{renderPage()}
				</div>
			)}
			{piecemeal && <div className={classes.piecemealContainter}>{renderPiecemeal()}</div>}
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash,
		foldState: state.appReducer.foldState,
		foldStateHash: state.appReducer.foldState.hash,
		editorState: state.appReducer.editorState,
		editorStateHash: state.appReducer.editorState.hash
	};
};

export default connect(mapStateToProps, { setLayoutState, setFoldState, setEditorState })(Body);
