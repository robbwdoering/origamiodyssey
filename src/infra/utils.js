/**
 * FILENAME: Constants.js 
 *
 * DESCRIPTION: Contains constants for use accross the app. 
 */

/*
 * This walks the tree recursively, collecting an array of steps at this "level".
 */
export const collectStepsForLevel = (fold, level) => {
	if (!fold || !fold.instructions) {
		return [];
	}

	return calcStepsForLevel(fold.instructions, level, 0);
};

/**
 * Recursive function to build the "step array" for a tree.
 * The basic concept here is that the user will choose a depth, then this will build an array
 * of sequential steps "at" that depth.
 */
export const calcStepsForLevel = (inst, targetLevel, curLevel) => {
	if (!inst.children && !inst.length) {
		// Error case
		return null;
	}

	// console.log("[calcStepsForLevel]", inst, targetLevel, curLevel);

	// Leaf nodes
	if (Array.isArray(inst)) {
		return curLevel >= targetLevel ? [inst] : [];

		// Ancestor nodes
	} else {
		if (curLevel === targetLevel) {
			// Recursive case: This is target, so COMBINE children to one array
			return inst.children.reduce((acc, childInst) => {
				let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
				if (ret) {
					acc.push(ret);
				}
				return acc;
			}, []);
		} else if (curLevel > targetLevel) {
			// Recursive case: past target level, so COLLECT children into one array
			return inst.children.reduce((acc, childInst) => {
				let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
				if (ret) {
					return acc.concat(ret);
				}
				return acc;
			}, []);
		} else if (curLevel < targetLevel) {
			// Recursive case: still above target level, so keep drilling down
			if (curLevel === targetLevel - 1) {
				// If we're right before the target, return all children
				return inst.children.map(childInst => calcStepsForLevel(childInst, targetLevel, curLevel + 1));
			} else {
				// Else COLLECT children into one array
				return inst.children.reduce((acc, childInst) => {
					let ret = calcStepsForLevel(childInst, targetLevel, curLevel + 1);
					if (ret) {
						return acc.push(ret);
					}
					return acc;
				}, []);
			}
		}
	}
};

/**
 * Recursive function to calculate the depth of the instruction tree
 */
export const calcMaxLevel = inst => {
	if (inst.children && Array.isArray(inst.children[0])) {
		// Base case: leaf node
		return 1;
	} else if (inst.children) {
		// Recursive case: Return 1 plus the height of the tallest subtree
		return 1 + Math.max(...inst.children.map(childInst => calcMaxLevel(childInst)));
	} else {
		return 0;
	}
};

