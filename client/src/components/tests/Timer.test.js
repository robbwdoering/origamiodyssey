/**
 * FILENAME: Timer.test.js
 */

// React + Enzyme
import React from "react";
import { act } from 'react-dom/test-utils';
import { mount } from "./../../infra/enzyme";

// Local
import { testRedux } from "./../../infra/testConstants";
import { Folds } from "./../../infra/constants";
import { Timer } from "./../Timer";

describe("Timer", () => {
	let comp;
	let setLayoutState, setFoldState, addHistoryEntry;

	beforeEach(() => {
		setLayoutState = jest.fn();
		setFoldState = jest.fn();
		addHistoryEntry = jest.fn();

		comp = mount(
			<Timer
				isHidden={false}
				isActive={false}
				placeholderRef={{ current: {offsetTop: 5, offsetLeft: 10} }}

				layoutState={Object.assign({}, testRedux.layoutState)}
				layoutStateHash={0}
				foldState={Object.assign({}, testRedux.foldState)}
				foldStateHash={0}
				userState={Object.assign({}, testRedux.userState)}
				userStateHash={0}
				setLayoutState={setLayoutState}
				setFoldState={setFoldState}
				addHistoryEntry={addHistoryEntry}
			/>
		);
	});

	afterEach(() => {
		comp.unmount();
	});

	it("renders without crashing", () => {
		expect(comp).toMatchSnapshot();
	});

	it("starts the timer when clicked", async () => {
		await act(async () => {
			// Start the timer
			comp.find('button.MuiButton-root').first().simulate('click')

			// Wait 2 seconds
			await new Promise((r) => setTimeout(r, 2001));

			// Stop the timer, so it sends the result to redux
			comp.find('button.MuiButton-root').first().simulate('click')
		});

		// Check the last redux change to go out (first call is with 0)
		expect(setFoldState.mock.calls.length).toBe(2);
		expect(setFoldState.mock.calls[1][0].lastRecordedTimer > testRedux.foldState.lastRecordedTimer).toBe(true);
	});

	it("displays no 'play' arrow when already playing", () => {
		// Start the timer
		act(() => {
			comp.find('button.MuiButton-root').first().simulate('click');
		});
		comp.update();

		expect(comp.exists('#oo-timer-play-icon')).toBe(false);
	});

	it("displays a play arrow when paused", () => {
		expect(comp.find('#oo-timer-play-icon').exists()).toBe(true);
	});

	it("resets the timer when clicked", async () => {
		await act(async () => {
			// Start the timer
			comp.find('button.MuiButton-root').first().simulate('click')

			// Wait 2 seconds
			await new Promise((r) => setTimeout(r, 2500));
		});

		// Check that the text of the timer advanced
		expect(comp.find('button.MuiButton-root').first().text()).toBe('00:02');
	});


	it("shows snackbar upon completion", () => {
		// Move this to the last step
		comp.setProps({ foldState: Object.assign({}, testRedux.foldState, { stepIdx: testRedux.foldState.maxSteps }) });
		comp.update();

		expect(comp.exists('#oo-timer-snackbar'));
		expect(comp.find('#oo-timer-snackbar').first().prop('open')).toBe(true);
	});

	it("sends details upon closing snackbar", () => {
		// Move this to the last step
		comp.setProps({ foldState: Object.assign({}, testRedux.foldState, { stepIdx: testRedux.foldState.maxSteps }) });
		comp.update();

		// Close the snackbar by navigating to the models page
		comp.find("#oo-timer-snackbar").last().find('button').last().simulate('click');
		comp.update();

		// Check 'model select'
		expect(setLayoutState).toHaveBeenCalled();
		expect(setFoldState).toHaveBeenCalled();
		expect(comp.find('#oo-timer-snackbar').first().prop('open')).toBe(false);
		expect(addHistoryEntry.mock.calls.length).toBe(1);
	});

	it("only sends details once upon closing snackbar", () => {
		// Move this to the last step
		comp.setProps({ foldState: Object.assign({}, testRedux.foldState, { stepIdx: testRedux.foldState.maxSteps }) });
		comp.update();

		// Close the snackbar by folding another
		comp.find("#oo-timer-snackbar").last().find('button').last().simulate('click');
		comp.update();

		// Move this to the last step again
		comp.setProps({ foldState: Object.assign({}, testRedux.foldState, { stepIdx: testRedux.foldState.maxSteps }) });
		comp.update();

		// Close the snackbar by folding another
		comp.find("#oo-timer-snackbar").last().find('button').last().simulate('click');
		comp.update();

		// Check 'fold another'
		expect(setLayoutState).toHaveBeenCalled();
		expect(setFoldState).toHaveBeenCalled();
		expect(comp.find('#oo-timer-snackbar').first().prop('open')).toBe(false);
		expect(addHistoryEntry.mock.calls.length).toBe(1); // important: NOT 2
	});

	it("generates a Likert scale without crashing", () => {
		// Move this to the last step to show snackbar
		comp.setProps({
			foldState: Object.assign({}, testRedux.foldState, { stepIdx: testRedux.foldState.maxSteps }),
			userState: Object.assign({}, testRedux.userState, { showLikertAssess: true })
		});
		comp.update();

		// Open the quality assesment snackbar
		const button = comp.find("#oo-timer-snackbar").last().find('button').at(1);
		button.simulate('click');
		comp.update();

		expect(comp.find("#oo-timer-snackbar").first()).toMatchSnapshot();
	})
});
