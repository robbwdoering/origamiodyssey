/**
 * FILENAME: ModelSelect.test.js
 */

// React + Enzyme 
import React from 'react';
import { shallow } from './../../infra/enzyme';

// Local
import { testRedux } from './../../infra/testConstants';
import { Folds } from './../../infra/constants';
import { ModelSelect } from './../ModelSelect';

describe('Model Selection Page', () => {
	let comp;
	let setLayoutState;

	beforeEach(() => {
		comp = shallow(
			<ModelSelect 
				// Redux
				layoutState={Object.assign({}, testRedux.layoutState)}
				layoutStateHash={0}
				setLayoutState={setLayoutState}
			/>
		);
	});

	afterEach(() => {
		comp.unmount();
	});

	it('renders without crashing', () => {
		expect(comp).toMatchSnapshot();
	});
});