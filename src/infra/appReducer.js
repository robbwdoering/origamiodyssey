/**
 * FILENAME: appReducer.js
 *
 * DESCRIPTION: Handles state update for all layout actions.
 */

// import supermemo2 from 'supermemo2';
import { initAppReducerState, Actions } from './constants';

const finalInitState = JSON.parse(JSON.stringify(initAppReducerState));

export const appReducer = (state = finalInitState, action) => {
	let newState = Object.assign({}, state);

	switch (action.type) {
		case Actions.SET_SHOW_NAV_DRAWER:
			// If passed a val set to that, otherwise toggle
			newState.showNavDrawer = action.payload !== undefined ? action.payload : !newState.showNavDrawer;
			break;
		case Actions.SET_LAYOUT_STATE:
			console.log('[SET_LAYOUT_STATE]', action.payload);
			Object.assign(newState.layoutState, action.payload || initAppReducerState.layoutState);
			newState.layoutState.hash++;
			break;
		case Actions.SET_FOLD_STATE:
			console.log('[SET_FOLD_STATE]', action.payload);
			Object.assign(newState.foldState, action.payload || initAppReducerState.foldState);
			newState.foldState.hash++;
			break;
		case Actions.SET_EDITOR_STATE:
			console.log('[SET_EDITOR_STATE]', action.payload);
			Object.assign(newState.editorState, action.payload || initAppReducerState.editorState);
			newState.editorState.hash++;
			break;
		case Actions.SET_USER_STATE:
			console.log('[SET_USER_STATE]', action.payload);
			Object.assign(newState.userState, action.payload || initAppReducerState.userState);
			newState.userState.hash++;
			break;
		case Actions.ADD_HISTORY_ENTRY:
			console.log('[ADD_HISTORY_ENTRY]', action.payload);
			if (!action.payload) {
				return newState;
			}
			newState.userState.foldHistory.push(action.payload)

			// If this model type is part of the memo alogirthm, update that entry 
			if (newState.modelList.find(model => model.foldKey === action.payload.foldKey)) {

			}

			// Update the spaced learning params given this new information

			newState.userState.hash++;
			break;
	}

	return newState;
};
