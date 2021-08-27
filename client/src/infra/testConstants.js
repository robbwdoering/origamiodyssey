/**
 * FILENAME: testConstants.js
 *
 * DESCRIPTION: Contains constants for use in the test suites.
 */

import { initAppReducerState } from './constants';

export const testRedux = Object.assign({}, initAppReducerState, {
    foldState: Object.assign({}, initAppReducerState.foldState, {
        maxSteps: 10
    }),
    userState: Object.assign({}, initAppReducerState.userState, {
        foldHistory: [
            {
                foldKey: 'SailBoat',
                time: 5000,
                quality: 3,
                timer: 4000
            }
        ]
    })
});
