/**
 * FILENAME: ModelCard.test.js
 */

// React + Enzyme 
import React from 'react';
import { shallow } from './../../infra/enzyme';

// Local
import { testRedux } from './../../infra/testConstants';
import { Folds } from './../../infra/constants';
import { ModelCard } from './../ModelCard';

describe('Model Card', () => {
	let comp;
	let handleCardClick;

			
	beforeEach(() => {
		handleCardClick = jest.fn();

		comp = shallow(
			<ModelCard 
				// Parent
				placeholderRef={{}} 
				name="Bird Base"
				cardKey='BirdBase'
				foldEntry={Folds.BirdBase}
				index={0}
				isActive={true}
				shouldOpenFlipped={false}
				isHidden={false}
				handleCardClick={handleCardClick}
				// Redux
				layoutState={Object.assign({}, testRedux.layoutState)}
				layoutStateHash={0}
			/>
		);
	});

	it('renders without crashing', () => {
		expect(comp).toMatchSnapshot();
	});
});