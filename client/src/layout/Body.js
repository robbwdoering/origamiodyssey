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
import { useAuth0 } from '@auth0/auth0-react';

import { Pages, Folds, initNavTree, Actions, DEF_API_OPTIONS } from './../infra/constants';
import { useApi } from './../infra/useApi';
import { setLayoutState, setFoldState, setEditorState, setUserState } from './../infra/actions';
// import Splash from './../components/Splash';
import ModelSelect from './../components/ModelSelect';
import FoldEditorCards from './../components/FoldEditorCards';
import User from './../components/User';
import InstructionalHierarchy from './../components/InstructionalHierarchy';
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
		setEditorState,
		userState,
		setUserState
	} = props;

	// ----------
	// STATE INIT
	// ----------
	const classes = useStyles();
	const containerRef = useRef();
	const fold = useRef({});
	const [curHash, setHash] = useState(0);
	const [cookies, setCookies] = useCookies([]);
	const { user, isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------
	const renderPage = () => {
		const pageProps = {};

		switch (layoutState.page) {
			case Pages.Splash:
				return null;
				// return <Splash {...pageProps} />;
			case Pages.ModelSelect:
				return <ModelSelect {...pageProps} />;
			case Pages.User:
				return <User {...pageProps} />;
			case Pages.Fold:
				return (
					<InstructionalHierarchy
						windowHeight={windowHeight}
						initFold={fold.current.json}
						foldLastUpdated={fold.current.lastUpdated}
					/>
				);
			default:
				return null;
		}
	};

	const renderPiecemeal = () => {
		switch (layoutState.page) {
			case Pages.Fold:
				return ((userState.showEditor) ? (
					<FoldEditorCards
						windowHeight={windowHeight}
						initFold={fold.current.json}
						curFold={layoutState.curFold}
						foldOverrideCallback={foldOverrideCallback}
						foldLastUpdated={fold.current.lastUpdated}
					/>
				) : null);
			case Pages.Splash:
			case Pages.ModelSelect:
			case Pages.User:
			default:
				return null;
		}
	};

	const selectFold = () => {
		// console.log('selectFold', layoutState, Folds);
		setFoldState({
			stepIdx: -1,
			active: false 
		});
		fold.current = {
			json:
				layoutState.curFold && Folds[layoutState.curFold]
					? JSON.parse(JSON.stringify(Folds[layoutState.curFold].json))
					: null,
			lastUpdated: Date.now()
		};

		// Scroll to the top of the page
		window.scroll(0, 0);

		triggerRerender();
	};

	const foldOverrideCallback = newFold => {
		// console.log('[foldOverrideCallback] ', newFold);
		Object.assign(fold.current.json, newFold);

		// Reset fold state
		setFoldState(null);
	};

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	const saveStateToCookies = () => {
		// const finalFoldState = Object.assign({}, foldState, { stepIdx: -1 });
		setCookies(
			'origamiodyssey_state',
			{ layoutState, foldState, editorState, userState },
			{ path: '/' }
		);
	};

	const fetchStateFromCookies = () => {
		if (cookies.origamiodyssey_state) {
			// console.log('Applying state from cookies.', cookies.origamiodyssey_state);
			// Override fields that we don't want to carry over between sessions 
			const layoutState = Object.assign({}, cookies.origamiodyssey_state.layoutState, { searchStr: '' });
			const foldState = Object.assign({}, cookies.origamiodyssey_state.foldState, { repeatRoot: -1, repeatRange: [] });
			const userState = Object.assign({}, cookies.origamiodyssey_state.userState);
			setLayoutState(layoutState);
			setFoldState(foldState);
			setEditorState(cookies.origamiodyssey_state.editorState);
			setUserState(userState);
		} else {
			console.log('Failed to apply cookies.', cookies);
		}
	};

	/**
	 * Tell the useApi() hook to send a new fetch request to the API after getting the authentication token.
	 */
	const fetchFromApi = async () => {
		if (isAuthenticated && !isLoading) {
			console.log('[fetchFromApi]', user)
			refresh(`/${user.email}`);
		}
	}

	/**
	 * This callback understands every redux-oriented response from the server, storing the relevant data in redux
	 * through the use of package-specific reducers.
	 */
	const handleFetchResult = useMemo(() => (json) => {
		console.log("[handleFetchResult]", json);
		if (!json) {
			return;
		}
		switch (json.type) {
			case Actions.SET_LAYOUT_STATE:
				setLayoutState(json.payload);
				break;
			case Actions.SET_FOLD_STATE:
				setFoldState(json.payload);
				break;
			case Actions.SET_EDITOR_STATE:
				setEditorState(json.payload);
				break;
			case Actions.SET_USER_STATE:
				setUserState(json.payload);
				break;
			default:
				throw new Error(`Unrecognized Type: ${json.type}`);
		}
	}, []);


	// ---------
	// LIFECYCLE
	// ---------

	// Setup the API connection for the backend - managed by the custom hook
	const { loading, error, refresh, data: users } = useApi('/users', 'GET', DEF_API_OPTIONS, handleFetchResult);

	// When authenticated for the first time, request user data from API
	useEffect(fetchFromApi, [getAccessTokenSilently, isLoading, isAuthenticated]);

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

	const sceneStyle = {
		height: windowHeight + 64 + 'px',
		display: layoutState.page === Pages.Fold ? undefined : "none"
	};

	// console.log('[body]', fold.current);

	return (
		<div className={classes.bodyContainer} ref={containerRef}>
			<div className={classes.sceneContainer} style={sceneStyle}>
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
		editorStateHash: state.appReducer.editorState.hash,
		userState: state.appReducer.userState,
		userStateHash: state.appReducer.userState.hash
	};
};

export default connect(mapStateToProps, { setLayoutState, setFoldState, setEditorState, setUserState })(Body);
