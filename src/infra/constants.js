/**
 * FILENAME: Constants.js 
 *
 * DESCRIPTION: Contains constants for use accross the app. 
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import GitHubIcon from "@material-ui/icons/GitHub";
import SchoolIcon from "@material-ui/icons/School";
import ClassIcon from "@material-ui/icons/Class";
import DashboardIcon from "@material-ui/icons/Dashboard";
import GroupAddIcon from "@material-ui/icons/GroupAdd";

export const Pages = {
	Splash: "Splash",
	Lesson: "Lesson",
	History: "History",
	LearnDashboard: "LearnDashboard",
	TeachDashboard: "TeachDashboard"
};

export const initAppReducerState = {
	layoutState: {
		curPage: Pages.Splash,
		hash: 0
	},
	showNavDrawer: false
};

export const Actions = {
	SET_SHOW_NAV_DRAWER: "SET_SHOW_NAV_DRAWER",
	SET_PAGE_CONFIG: "SET_PAGE_CONFIG",
};

export const initNavTree = [
	{	
		text: "What is Origami?",
		key: "context_root",
		children: [
			{
				text: "History",
				key: "history"				
			},
			{
				text: "Origami Today",
				key: "current_origami"
			},
			{
				text: "Practical Origami",
				key: "practical"
			}
		]
	},
	{	
		text: "Learn Origami",
		key: "learn_root",
		children: [
			{
				icon: <DashboardIcon />,
				text: "Dashboard",
				key: "learn_dashboard"				
			},
			{
				icon: <GroupAddIcon />,
				text: "Join Class",
				key: "join_class"
			}
		]
	},
	{	
		text: "Teach Origami",
		key: "teach_root",
		children: [
			{
				icon: <DashboardIcon />,
				text: "Lesson Plans",
				key: "lesson_plan_dashboard"				
			},
			{
				icon: <SchoolIcon />,
				text: "Read Research Paper",
				key: "google_scholar"
			},
			{
				icon: <ClassIcon />,
				text: "Origami in the Classroom",
				key: "teaching_tips"
			}
		]
	},
	{	
		icon: <GitHubIcon />,
		text: "Source Code",
		key: "github"
	},
];

export const initFoldState = {
	//place to store buffer geo vertex data
	positions: [],
	//place to store buffer geo vertex colors
	colors: [],
	indices: [],
	nodes: [], 
	faces: [], 
	edges: [], 
	creases: [], 
	vertices: [], //indexed vertices array
	fold: null,
	creaseParams: null
}

/*
export const Lines = {
    U: hingeLines,
    M: mountainLines,
    V: valleyLines,
    C: cutLines,
    F: facetLines,
    B: borderLines
};
*/
