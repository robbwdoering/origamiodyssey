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

export const setFoldName = payload => ({
	type: Actions.SET_FOLD_NAME,
	payload
});