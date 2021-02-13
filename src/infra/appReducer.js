/**
 * FILENAME: appReducer.js 
 *
 * DESCRIPTION: Handles state update for all layout actions.
 */

import { initAppReducerState, Actions } from "./constants";

export const appReducer = (state = initAppReducerState, action) => {
	let newState = Object.assign({}, state);

	console.log("[reducer]", state, action);

	switch (action.type) {
		case Actions.SET_SHOW_NAV_DRAWER:
			// If passed a val set to that, otherwise toggle
			newState.showNavDrawer = (action.payload !== undefined) ? action.payload : !newState.showNavDrawer;
			break;
		case Actions.SET_LAYOUT_STATE:
			Object.assign(newState.layoutState, action.payload);
			newState.layoutStateHash++;
			break;
		default:
			console.error("Received an unknown action type: ", action.type);
	}

	return newState;
}