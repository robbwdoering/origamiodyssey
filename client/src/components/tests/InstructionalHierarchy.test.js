/**
 * FILENAME: InstructionalHierarchy.test.js
 */

// React + Enzyme
import React from 'react';
import { mount } from './../../infra/enzyme';

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

		comp = mount(
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

	it('changes step when the buttons are used', () => {
		// Advance one
		comp.find('#oo-main-button-step-ctrls').find('button').last().simulate('click');

		expect(setFoldState).toHaveBeenCalled();
		expect(setFoldState.mock.calls[0][0].stepIdx).toBe(0);

		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, {
				stepIdx: 5
			})
		});
		comp.update();
		comp.find('#oo-main-button-step-ctrls').find('button').first().simulate('click');

		expect(setFoldState.mock.calls.length).toBe(2);
		expect(setFoldState.mock.calls[1][0].stepIdx).toBe(4);
	});

	it('changes step when a node is clicked on', () => {
		comp.find('ForwardRef(Tooltip)').at(5).simulate('click');

		expect(setFoldState).toHaveBeenCalled();
		expect(setFoldState.mock.calls[0][0].stepIdx).toBe(3);
	});

	it('enables looping behavior', () => {
		// Turn on looper
		comp.find('ForwardRef(Tooltip)').at(5).simulate('click', { shiftKey: true });

		expect(setFoldState).toHaveBeenCalled();
		expect(setFoldState.mock.calls[0][0]).toEqual({
			repeatRange: [ 4, 7 ],
			repeatRoot: 4,
			stepIdx: 3
		});
	});

	it('looper changes steps predictably', () => {
		// Turn on looper
		comp.find('ForwardRef(Tooltip)').at(5).simulate('click', { shiftKey: true });
		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, {
				repeatRange: [ 4, 7 ],
				repeatRoot: 4,
				stepIdx: 3
			})
		});
	});

	it('modifies looper with subsequent shift clicks', () => {
		// Turn on looper
		comp.find('ForwardRef(Tooltip)').at(5).simulate('click', { shiftKey: true });
		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, {
				repeatRange: [ 4, 7 ],
				repeatRoot: 4,
				stepIdx: 3
			})
		});

		comp.find('ForwardRef(Tooltip)').at(10).simulate('click', { shiftKey: true });
		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, {
				repeatRange: [ 4, 12 ],
				repeatRoot: 4,
				stepIdx: 4 
			})
		});

		comp.find('ForwardRef(Tooltip)').at(0).simulate('click', { shiftKey: true });
		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, {
				repeatRange: [ 0, 12 ],
				repeatRoot: 0,
				stepIdx: 0 
			})
		});
	});

	it('clears looper when any node is clicked', () => {
		// Turn on looper
		comp.find('ForwardRef(Tooltip)').at(5).simulate('click', { shiftKey: true });
		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, {
				repeatRange: [ 4, 7 ],
				repeatRoot: 4,
				stepIdx: 3
			})
		});

		comp.find('ForwardRef(Tooltip)').at(10).simulate('click');
		expect(setFoldState).toHaveBeenCalled();
		expect(setFoldState).toHaveBeenLastCalledWith({
			repeatRange: null,
			repeatRoot: -1,
			stepIdx: 12
		});
	});
});
