/**
 * FILENAME: InstructionalHierarchy.test.js
 */

// React + Enzyme
import React from 'react';
import { shallow } from './../../infra/enzyme';

// Local
import { testRedux } from './../../infra/testConstants';
import { Folds } from './../../infra/constants';
import { InstructionalHierarchy } from './../InstructionalHierarchy';

describe('Fold Editor', () => {
	let comp;
	let setFoldState, setLayoutState, setUserState;

	beforeEach(() => {
		setFoldState = jest.fn();
		setLayoutState = jest.fn();
		setUserState = jest.fn();

		comp = shallow(
			<InstructionalHierarchy
				windowHeight={500}
				initFold={Object.assign({}, Folds.BirdBase.json)}
				foldLastUpdated={0}
				foldState={Object.assign({}, testRedux.foldState)}
				foldStateHash={0}
				layoutState={Object.assign({}, testRedux.layoutState)}
				layoutStateHash={0}
				userState={Object.assign({}, testRedux.userState)}
				userStateHash={0}
				setFoldState={setFoldState}
				setLayoutState={setLayoutState}
				setUserState={setUserState}
			/>
		);
	});

	afterEach(() => {
		comp.unmount();
	});

	it('renders without crashing', () => {
		expect(comp).toMatchSnapshot();
	});

	it('does something else', () => {
		expect(comp).toMatchSnapshot();
	});
});
