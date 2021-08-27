/**
 * FILENAME: ModelCard.test.js
 */

// React + Enzyme 
import React from 'react';
import { mount } from './../../infra/enzyme';

// Local
import { testRedux } from './../../infra/testConstants';
import { Folds } from './../../infra/constants';
import { ModelCard } from './../ModelCard';

describe('Model Card', () => {
	let comp;
	let setLayoutState, handleCardClick, preventDefault, stopPropagation;

			
	beforeEach(() => {
		setLayoutState = jest.fn();
		handleCardClick = jest.fn();
		preventDefault = jest.fn();
		stopPropagation = jest.fn();

		comp = mount(
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

	it('opens fold pages', () => {
		comp.find('button').last().simulate('click', { preventDefault, stopPropagation });
	});
});