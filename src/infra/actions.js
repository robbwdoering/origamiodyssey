/**
 * FILENAME: actions.js
 *
 * DESCRIPTION: Contains all redux actions. Could split this out, but why bother - there's not going to be many actions. 
 */

import { Actions } from "./constants";

export const setShowNavDrawer = payload => ({
	type: Actions.SET_SHOW_NAV_DRAWER,
	payload
});

export const setLayoutState = payload => ({
	type: Actions.SET_LAYOUT_STATE,
	payload
});

export const setFoldState = payload => ({
	type: Actions.SET_FOLD_STATE,
	payload
});

export const setEditorState = payload => ({
	type: Actions.SET_EDITOR_STATE,
	payload
});