/**
 * FILENAME: User.test.js
 */

// React + Enzyme
import React from 'react';
import { shallow, loginWithRedirect, logout } from './../../infra/enzyme';

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

	it('renders menu options', () => {
		// Open the menu
		comp.find('#oo-assistant-add-model').simulate('click', { currentTarget: {} });
		const menu = comp.find({ name: 'modelAdd' }).first();
		expect(menu.exists()).toBe(true);
		expect(menu.prop('open')).toBe(true);

		expect(menu).toMatchSnapshot();
	});

	// this is a long one, necessary to smoothly test adding and deleting
	it('modifies the the assistant list', () => {
		// Open the menu
		comp.find('#oo-assistant-add-model').simulate('click', { currentTarget: {} });
		const menu = comp.find({ name: 'modelAdd' }).first();

		// Add a model from it
		menu.find('WithStyles(ForwardRef(MenuItem))').first().simulate('click');

		expect(setUserState.mock.calls.length).toBe(1);
		const newEntry = setUserState.mock.calls[0][0].modelList[0];
		expect(newEntry.foldKey).toBe('SailBoat');

		// Use the object to actually change the props
		comp.setProps({
			userState: Object.assign({}, testRedux.userState, { modelList: [newEntry] })
		});

		// Remove the added model
		comp.find({ title: 'Remove this model from the schedule' }).first().simulate('click');

		expect(setUserState.mock.calls.length).toBe(2);
		expect(setUserState.mock.calls[1][0].modelList.length).toBe(0);
	});

	it('renders history tab without crashing', () => {
		comp.find('WithStyles(ForwardRef(Tabs))').prop('onChange')({}, 1);
		comp.update();
		expect(comp.find('#oo-assistant')).toMatchSnapshot();
	});

	it('renders settings tab without crashing', () => {
		comp.find('WithStyles(ForwardRef(Tabs))').prop('onChange')({}, 2);
		comp.update();
		expect(comp.find('#oo-assistant')).toMatchSnapshot();
	});

	it('renders login page', () => {
		comp.setProps({
			logoutOverride: true
		});
		comp.update();

		expect(comp.exists('#oo-assistant')).toBe(false);
		expect(comp).toMatchSnapshot();
	});

	it('changes preferences when toggles are clicked', () => {
		// Click every toggle button
		const toggles = comp.find('#oo-preferences-container').find({ value: false, selected: false });
		for (let i = 0; i < toggles.length; i++) {
			toggles.at(i).prop('onChange')();
		}

		expect(toggles.length).toBe(3);
		expect(setUserState.mock.calls.length).toBe(toggles.length);
		expect(Object.keys(setUserState.mock.calls[toggles.length - 1][0])[0]).toBe('showLikertAssess');
	});
});
