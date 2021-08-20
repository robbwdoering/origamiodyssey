/**
 * FILENAME: User.test.js
 */

// React + Enzyme 
import React from 'react';
import { shallow } from './../../infra/enzyme';

// Local
import { testRedux } from './../../infra/testConstants';
import { Folds } from './../../infra/constants';
import { User } from './../User';

describe('User Page', () => {
	let comp;
	let setUserState, setLayoutState;

	beforeEach(() => {
		setUserState = jest.fn();
		setLayoutState = jest.fn();

		comp = shallow(
			<User 
				// Redux
				userState={Object.assign({}, testRedux.userState)}
				userStateHash={0}
				layoutState={Object.assign({}, testRedux.layoutState)}
				layoutStateHash={0}
				setUserState={setUserState}
				setLayoutState={setLayoutState}
			/>
		);
	});

	it('renders without crashing', () => {
		expect(comp).toMatchSnapshot();
	});
});