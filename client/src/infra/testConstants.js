/**
 * FILENAME: testConstants.js
 *
 * DESCRIPTION: Contains constants for use in the test suites. 
 */

import { initAppReducerState } from "./constants";

export const testRedux = Object.assign({}, initAppReducerState, {
    foldState: Object.assign({}, initAppReducerState.foldState, {
        maxSteps: 10
    })
});
