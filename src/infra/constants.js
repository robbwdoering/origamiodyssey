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

// The FOLD files 
import BirdBase from "./../folds/BirdBase.json";
import BoatBase from "./../folds/BoatBase.json";
import FrogBase from "./../folds/FrogBase.json";
import SailBoat from "./../folds/SailBoat.json";

export const Pages = {
	Splash: "Splash",
	ModelSelect: "ModelSelect",
	Fold: "Fold",
	User: "User",

	// Used but undefined
	Lesson: "Lesson",
	History: "History",
	LearnDashboard: "LearnDashboard",
	TeachDashboard: "TeachDashboard"
};

export const Tags = {
	base: {
		text: "Base",
		category: "family"
	},
	bird: {
		text: "Bird",
		category: "counterpart",
	},
	boat: {
		text: "Boat",
		category: "counterpart"
	},
	flower: {
		text: "Flower",
		category: "counterpart"
	}
};

export const Folds = {
	BirdBase: {
		name: "Bird Base",
		description: "The first base many learn, this is perfect for winged creations such as birds and dragons.",
		tags: ["base"],
		author: "Traditional",
		json: BirdBase
	},
	BoatBase: {
		name: "Boat Base",
		description: "A more specific base for blocky models, such as boats and frames.",
		tags: ["base"],
		author: "Traditional",
		json: BoatBase
	},
	FrogBase: {
		name: "Frog Base",
		description: "A complex base used for models with length-wise asymmetry, like flowers and animals.",
		tags: ["base"],
		author: "Traditional",
		json: FrogBase 
	},
	SailBoat: {
		name: "Sail Boat",
		description: "An assymetrical sailboat with a built in kickstand - perfect for display.",
		tags: ["boat"],
		author: "Traditional",
		json: SailBoat 
	}
};

export const initAppReducerState = {
	layoutState: {
		hash: 0,
		page: Pages.ModelSelect,
		curFold: null,
		foldHash: 0,
		useImages: false,
		showEditor: true,
		expandHierarchy: false 
	},
	foldState: {
		hash: 0,
		selectedLevel: 0,
		stepIdx: -1, // Depends on selected level
		overrideWithEditor: false,
		usingDefaults: true
	},
	editorState: {
		hash: 0,
		edgeHighlights: [],
		vertexHighlights: [],
		faceHighlights: [],
		showEdges: true,
		showVertices: true,
		showFaces: true,
		showTriangulations: false,
		showLables: false
	},
	showNavDrawer: false

};

export const Actions = {
	SET_LAYOUT_STATE: "SET_LAYOUT_STATE",
	SET_SHOW_NAV_DRAWER: "SET_SHOW_NAV_DRAWER",
	SET_PAGE_CONFIG: "SET_PAGE_CONFIG",
	SET_FOLD_STATE: "SET_FOLD_STATE",
	SET_EDITOR_STATE: "SET_EDITOR_STATE",
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
