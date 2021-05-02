/**
 * FILENAME: Constants.js
 *
 * DESCRIPTION: Contains constants for use accross the app.
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import GitHubIcon from '@material-ui/icons/GitHub';
import SchoolIcon from '@material-ui/icons/School';
import ClassIcon from '@material-ui/icons/Class';
import DashboardIcon from '@material-ui/icons/Dashboard';
import GroupAddIcon from '@material-ui/icons/GroupAdd';

// The FOLD files
import BirdBase from './../folds/BirdBase.json';
import BoatBase from './../folds/BoatBase.json';
import FrogBase from './../folds/FrogBase.json';
import WaterBombBase from './../folds/WaterBombBase.json';
import SailBoat from './../folds/SailBoat.json';
import Heart from './../folds/Heart.json';
import Crane from './../folds/Crane.json';
import Butterfly from './../folds/Butterfly.json';
import Lily from './../folds/Lily.json';

// Images
import lilyImage from './../static/lily_thumbnail.png';
import craneImage from './../static/crane_thumbnail.png';
import butterflyImage from './../static/butterfly_thumbnail.png';
import heartImage from './../static/heart_thumbnail.png';
import sailboatImage from './../static/sailboat_thumbnail.png';
import waterbomb_baseImage from './../static/waterbomb_base_thumbnail.png';
import boat_baseImage from './../static/boat_base_thumbnail.png';
import bird_baseImage from './../static/bird_base_thumbnail.png';

export const Pages = {
	Splash: 'Splash',
	ModelSelect: 'ModelSelect',
	Fold: 'Fold',
	User: 'User',

	// Used but undefined
	Lesson: 'Lesson',
	History: 'History',
	LearnDashboard: 'LearnDashboard',
	TeachDashboard: 'TeachDashboard'
};

export const TagCategories = {
	type: {
		text: 'Type',
		xs: 6,
		sm: 4,
		md: 2
	},
	author: {
		text: 'Author',
		xs: 6,
		sm: 4,
		md: 2
	},
	counterpart: {
		text: 'Object',
		xs: 12,
		sm: 8,
		md: 4
	},
	duration: {
		text: 'Time',
		xs: 12,
		sm: 8,
		md: 4
	}
};

export const Tags = {
	base: {
		text: 'Base',
		category: 'type'
	},
	model: {
		text: 'Model',
		category: 'type'
	},
	traditional: {
		text: 'Traditional',
		category: 'author'
	},
	bird: {
		text: 'Bird',
		category: 'counterpart'
	},
	insect: {
		text: 'Insect',
		category: 'counterpart'
	},
	animal: {
		text: 'Animal',
		category: 'counterpart'
	},
	boat: {
		text: 'Boat',
		category: 'counterpart'
	},
	flower: {
		text: 'Flower',
		category: 'counterpart'
	},
	five_mins: {
		text: '5 Mins',
		category: 'duration'
	},
	fifteen_mins: {
		text: '15 Mins',
		category: 'duration'
	},
	thirty_mins: {
		text: '30 Mins',
		category: 'duration'
	},
	hour_plus: {
		text: '1+ hours',
		category: 'duration'
	}
};

export const Folds = {
	SailBoat: {
		name: 'Sail Boat',
		staticImg: sailboatImage,
		description: 'An assymetrical sailboat with a built in kickstand - perfect for display.',
		tags: ['model', 'boat', 'five_mins'],
		author: 'Traditional',
		json: SailBoat
	},
	Heart: {
		name: 'Heart',
		staticImg: heartImage,
		description: "A flat heart that's particularly easy to fold - a great place to start.",
		tags: ['model', 'five_mins'],
		author: 'Traditional',
		json: Heart
	},
	Crane: {
		name: 'Crane',
		staticImg: craneImage,
		description: 'The quintessential origami model - fold 1000 of these!',
		tags: ['model', 'fifteen_mins', 'bird', 'animal'],
		author: 'Traditional',
		json: Crane
	},
	Butterfly: {
		name: 'Butterfly',
		staticImg: butterflyImage,
		description: 'A 3D flapping butterfly built upon a boat base.',
		tags: ['model', 'five_mins', 'insect', 'animal'],
		author: 'Traditional',
		json: Butterfly
	},
	Lily: {
		name: 'Lily',
		staticImg: lilyImage,
		description: 'A symmetrical flower perfect for a boquet, or mounted on a folded stem.',
		tags: ['model', 'fifteen_mins', 'flower'],
		author: 'Traditional',
		json: Lily
	},
	BirdBase: {
		name: 'Bird Base',
		staticImg: bird_baseImage,
		description: 'The first base many learn, this is perfect for winged creations such as birds and dragons.',
		tags: ['base'],
		author: 'Traditional',
		json: BirdBase
	},
	WaterBombBase: {
		name: 'Waterbomb Base',
		staticImg: waterbomb_baseImage,
		description: 'A very simple base with four flaps.',
		tags: ['base'],
		author: 'Traditional',
		json: WaterBombBase
	},
	BoatBase: {
		name: 'Boat Base',
		staticImg: boat_baseImage,
		description: 'A more specific base for blocky models, such as boats and frames.',
		tags: ['base'],
		author: 'Traditional',
		json: BoatBase
	}
};

export const initAppReducerState = {
	layoutState: {
		hash: 0,
		page: Pages.ModelSelect,
		curFold: null,
		useImages: false,
		showEditor: true,
		expandHierarchy: false,
		searchStr: ''
	},
	foldState: {
		hash: 0,
		stepIdx: -1, // Depends on selected level
		active: false,
		overrideWithEditor: false,
		usingDefaults: true,
		repeatRoot: -1,
		repeatRange: null,
		lastRecordedTimer: 0,
		lastRecordedLikert: 0
	},
	editorState: {
		hash: 0,
		edgeHighlights: [],
		vertexHighlights: [],
		faceHighlights: [],
		showEdges: false,
		showVertices: false,
		showFaces: true,
		showTriangulations: false,
		showLables: false
	},
	userState: {
		hash: 0,
		showEditor: false,
		username: null,
		showTimerAssess: false,
		showLikertAssess: false,
		modelList: [],
		foldHistory: []
	},
	showNavDrawer: false
};

export const Actions = {
	SET_LAYOUT_STATE: 'SET_LAYOUT_STATE',
	SET_SHOW_NAV_DRAWER: 'SET_SHOW_NAV_DRAWER',
	SET_PAGE_CONFIG: 'SET_PAGE_CONFIG',
	SET_FOLD_STATE: 'SET_FOLD_STATE',
	SET_EDITOR_STATE: 'SET_EDITOR_STATE',
	SET_USER_STATE: 'SET_USER_STATE',
	ADD_HISTORY_ENTRY: 'ADD_HISTORY_ENTRY'
};

export const initNavTree = [
	{
		text: 'Return to Fold',
		conditional: "is_saved_fold",
		className: "primary-drawer-node",
		key: Pages.Fold 
	},
	{
		text: 'Model Select',
		key: Pages.ModelSelect 
	},
	{
		text: 'User Page',
		conditional: "is_logged_in",
		key: Pages.User 
	},
	{
		text: 'Login / Register',
		conditional: "is_not_logged_in",
		key: 'login' 
	},
	// {
	// 	text: 'What is Origami?',
	// 	key: 'context_root',
	// 	children: [
	// 		{
	// 			text: 'History',
	// 			key: 'history'
	// 		},
	// 		{
	// 			text: 'Origami Today',
	// 			key: 'current_origami'
	// 		},
	// 		{
	// 			text: 'Practical Origami',
	// 			key: 'practical'
	// 		}
	// 	]
	// },
	// {
	// 	text: 'Learn Origami',
	// 	key: 'learn_root',
	// 	children: [
	// 		{
	// 			icon: <DashboardIcon />,
	// 			text: 'Dashboard',
	// 			key: 'learn_dashboard'
	// 		},
	// 		{
	// 			icon: <GroupAddIcon />,
	// 			text: 'Join Class',
	// 			key: 'join_class'
	// 		}
	// 	]
	// },
	// {
	// 	text: 'Teach Origami',
	// 	key: 'teach_root',
	// 	children: [
	// 		{
	// 			icon: <DashboardIcon />,
	// 			text: 'Lesson Plans',
	// 			key: 'lesson_plan_dashboard'
	// 		},
	// 		{
	// 			icon: <SchoolIcon />,
	// 			text: 'Read Research Paper',
	// 			key: 'google_scholar'
	// 		},
	// 		{
	// 			icon: <ClassIcon />,
	// 			text: 'Origami in the Classroom',
	// 			key: 'teaching_tips'
	// 		}
	// 	]
	// },
	{
		icon: <GitHubIcon />,
		text: 'Source Code',
		key: 'github'
	}
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
};

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
