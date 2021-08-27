/**
 * FILENAME: Timer.test.js
 */

// React + Enzyme
import React from "react";
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
				isActive={true}
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

	it("displays no 'play' arrow when already playing", () => {
		expect(comp.find('svg.MuiButton-label')).toEqual({});
	});

	it("displays a play arrow when paused", () => {
		// comp.find("ButtonGroup#oo-timer-container").find("Button").first().simulate('click');
		const tmp = comp.find('button');
		console.log(tmp);

		expect(comp.find('svg.MuiButton-label')).not.toEqual({});
	});

	// it("", () => {
		
	// });

	// it("", () => {
		
	// });
});
