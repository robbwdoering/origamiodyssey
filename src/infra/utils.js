/**
 * FILENAME: Constants.js 
 *
 * DESCRIPTION: Contains constants for use accross the app. 
 */

/*
 * This walks the tree recursively, collecting an array of steps at this "level".
 */
export const collectStepsForLevel = (fold, level, isDefault) => {
	if (!fold || !fold.instructions) {
		return [];
	}

	return calcStepsForLevel(fold.instructions, level, 0, isDefault);
};

/**
 * Recursive function to build the "step array" for a tree.
 * The basic concept here is that the user will choose a depth, then this will build an array
 * of sequential steps "at" that depth.
 * @returns: a 2D array of step objects
 */
export const calcStepsForLevel = (inst, targetLevel, curLevel, isDefault, path="0") => {
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
		if (curLevel === targetLevel || isDefaultNode) {
			// Recursive case: This is target, so return all leaves below this as one step
			let allLeafDescendants = concatDescendants(inst, curLevel);
			// If we just found one leaf node, treat this as a normal step w/ a 2D arr
			if (allLeafDescendants.length === 1) {
				allLeafDescendants = allLeafDescendants[0];
			}
			return [[path, ...allLeafDescendants]];
		} else if (curLevel < targetLevel) {
			// Recursive case: still above target level, so keep drilling down
			// COLLECT steps returned from children into one array of steps
			return inst.children.reduce((acc, childInst, childIdx) => {
				let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1, isDefault, path + "," + childIdx);
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

export const printPath = path => path.reduce((acc, idx, i) => (i ? "," : "") + idx, "");

export const stepIs3D = step => step.length && step[0].length && Array.isArray(step[0][0]);
