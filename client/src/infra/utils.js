/**
 * FILENAME: utils.js
 *
 * DESCRIPTION: Contains functions and hooks for use across the app.
 */

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/*
 * This walks the tree recursively, collecting an array of steps at this "level".
 */
export const collectStepsForLevel = (fold, level, isDefault) => {
	// console.log("[collectStepsForLevel]", fold, level, isDefault);
	if (!fold || !fold.instructions) {
		return [];
	}

	return calcStepsForLevel(fold.instructions, level, isDefault);
};

/**
 * Recursive function to build the "step array" for a tree.
 * The basic concept here is that the user will choose a depth, then this will build an array
 * of sequential steps "at" that depth.
 * @returns: a 2D array of step objects
 */
export const calcStepsForLevel = (inst, curLevel, isDefault, path = '0') => {
	if (!inst.children && !inst.length) {
		// Error case
		return null;
	}

	const isDefaultNode = isDefault && inst.default;

	// Leaf node / base case - return this as one step
	if (Array.isArray(inst.children[0])) {
		return [[path, ...inst.children]];

		// Ancestor nodes - return a list of steps
	} else {
		if (isDefaultNode) {
			// Recursive case: This is target, so return all leaves below this as one step
			let allLeafDescendants = concatDescendants(inst, curLevel);
			// If we just found one leaf node, treat this as a normal step w/ a 2D arr
			if (allLeafDescendants.length === 1) {
				allLeafDescendants = allLeafDescendants[0];
			}
			return [[path, ...allLeafDescendants]];
		} else {
			// Recursive case: still above target level, so keep drilling down
			// COLLECT steps returned from children into one array of steps
			return inst.children.reduce((acc, childInst, childIdx) => {
				let ret = calcStepsForLevel(childInst, curLevel + 1, isDefault, path + ',' + childIdx);
				return ret ? acc.concat(ret) : acc;
			}, []);
		}
	}

	return null;
};

/**
 * @returns: a 2D array of every leaf node found below this node
 */
export const concatDescendants = (inst, curLevel) => {
	if (Array.isArray(inst.children[0])) {
		return [[...inst.children]];
	} else {
		// turn many 1d arrs into one - concat
		return inst.children.reduce((acc, childInst) => {
			let ret = concatDescendants(childInst, curLevel + 1);
			return ret ? acc.concat(ret) : acc;
		}, []);
	}
};

/**
 * Recursive function to calculate the depth of the instruction tree
 */
export const calcMaxLevel = inst => {
	if (!inst) {
		return 0;
	} else if (inst.children && Array.isArray(inst.children[0])) {
		// Base case: leaf node
		return 1;
	} else if (inst.children) {
		// Recursive case: Return 1 plus the height of the tallest subtree
		return 1 + Math.max(...inst.children.map(childInst => calcMaxLevel(childInst)));
	} else {
		return 0;
	}
};

export const findInUseFamilyNode = (stepArr, path) => {
	return stepArr.reduce(
		(acc, step, index) => {
			// True if inUse step is an ancestor or descendant of this step
			if (path.startsWith(step[0]) || step[0].startsWith(path)) {
				// First index holds the first discovered descendant
				if (acc[0] == -1) {
					acc[0] = index;
				}

				// Second index holds the last discovered descendant
				acc[1] = index;
			}
			return acc;
		},
		[-1, -1]
	);
};

export const getHierNode = (instructions, path) => {
	if ((!path || !path.length) && instructions && instructions.desc) {
		// Base case: If we were passed an empty path, then this is the target node
		return instructions;
	} else if (path && path.length && instructions.children) {
		// Recurse Case: Else keep drilling down
		return getHierNode(instructions.children[parseInt(path[0])], path.slice(1));
	} else {
		// Error case: Return an error
		return {};
	}
};

/**
 * Returns true if the origCmds array includes a non-flex command on an edge including this vert.
 * @param origCmds the array of the original commands to check against (i.e. the commands in the actual json file)
 * @param vertIdx the index of the vertex in question
 */
export const cmdsInvolveVert = (origCmds, vertIdx) => {
	// console.log("[cmdsInvolveVert]", origCmds)
	return (
		origCmds &&
		origCmds.find(cmd => (cmd.length !== 4 || !cmd[3].flex) && (cmd[0] === vertIdx || cmd[1] === vertIdx))
	);
};

/**
 * Returns true if the origCmds array includes a non-flex command on an edge including this vert.
 * @param origCmds the array of the original commands to check against (i.e. the commands in the actual json file)
 * @param vertIdx the index of the vertex in question
 */
export const cmdsInvolveEdge = (origCmds, edge) => {
	// console.log("[cmdsInvolveEdge]", origCmds)
	if (stepIs3D(origCmds)) {
		return origCmds.find(subCmds => cmdsInvolveEdge(subCmds, edge));
	}

	return (
		origCmds &&
		origCmds.find(cmd => (cmd.length !== 4 || !cmd[3].flex) && edge.includes(cmd[0]) && edge.includes(cmd[1]))
	);
};

export const printPath = path => path.reduce((acc, idx, i) => (i ? ',' : '') + idx, '');

export const stepIs3D = step => step.length && step[0].length && Array.isArray(step[0][0]);

export const stepIs2D = step => step.length && Array.isArray(step[0]);

export const stepIs1D = step => step.length && !Array.isArray(step[0]);

export const stepHasArgs = step => step.length > 3 && step[3];

/**
 * A comparison function for use in sorting lists of cmds (i.e. a step).
 * Right now just puts flex items first - this is because they don't initiate movement,
 * but need to be processed in full before any movement begins.
 */
export const cmdOrderingComparator = (lhs, rhs) => {
	const lhsFlex = stepHasArgs(lhs) && lhs[3].flex;
	const rhsFlex = stepHasArgs(lhs) && lhs[3].flex;
	return lhsFlex && !rhsFlex ? 1 : rhsFlex ? -1 : 0;
};

export const timerPosixToString = timerPosix => {
	const date = new Date(timerPosix);
	const minStr = `${date.getMinutes()}`.padStart(2, '0');
	const secStr = `${date.getSeconds()}`.padStart(2, '0');
	return `${minStr}:${secStr}`;
};

/**
 * Detects whether localStorage is both supported and available.
 * src: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 */
const storageAvailable = (type) => {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}