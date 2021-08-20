/**
 * FILENAME: Timer.test.js
 */

// React + Enzyme
import React from "react";
import { shallow } from "./../../infra/enzyme";

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

		comp = shallow(
			<Timer
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
});
