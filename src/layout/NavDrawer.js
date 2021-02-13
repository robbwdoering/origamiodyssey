/**
 * FILENAME: NavDrawer.js 
 *
 * DESCRIPTION: A sidebar-based nav tree, custom built to take advantage of react-spring.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

import { SwipeableDrawer, Button, List, Divider, ListItem, } from '@material-ui/core';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import { Pages, initNavTree } from "./../infra/constants";
import { setShowNavDrawer, setLayoutState } from "./../infra/actions";
import useStyles from "./../style/theme";

export const NavDrawer = props => {
	const { page, showNavDrawer, setShowNavDrawer, setLayoutState } = props;

	const [navTreeData, setNavTree] = useState(initNavTree);
	const styles = useStyles();

	const findNode = (key, node = navTreeData, path = []) => {
		// Root case - recurse into array of subtrees
		if (Array.isArray(node)) {
			return node.reduce((acc, childNode) => {
				if (!acc) {
					const ret = findNode(key, childNode, path);

					if (ret && ret[1]) {
						acc = ret;
					}
				}
				return acc;
			}, null) || [null, null];

		// Success case - we found the node
		} else if (node.key === key) {
			return [[node.key, ...path], node];

		// Child case - recurse into children
		} else if (node.children) {
			return node.children.reduce((acc, childNode) => {
				if (!acc) {
					const [foundPath, foundNode] = findNode(key, childNode, path);

					if (foundNode) {
						acc = [[key, ...foundPath], foundNode];
					}
				}

				return acc;
			}, null) || [null, null];
		}

		// Failure case - return null
		return [[], null];
	}

	const setNode = (path, field, val, node = navTreeData) => {
		let newNavTree = [...navTreeData];

		// Nested function that recurses through the tree to modify a node
		const recursiveSet = (path, node = newNavTree) => {
			if (!path || path.length === 0) {
				node[field] = val; 
			} else if (Array.isArray(node)) {
				let child = node.find(e => e.key === path[0]);
				recursiveSet(path.slice(1), child);
			} else if (node.children) {
				let child = node.children.find(e => e.key === path[0]);
				recursiveSet(path.slice(1), child);
			}
		}

		recursiveSet(path);
		setNavTree(newNavTree);
	}

	const handleNavDrawerSelect = (event, key) => {
		if (!key) {
			return;
		}

		// If the key is a page ID, just take us to that page
		if (Object.keys(Pages).includes(key)) {
			setLayoutState({ curPage: key });
			return;
		} 

		// If the node has children, show or hide them on parent click
		const [path, node] = findNode(key);
		if (node.children) {
			setNode(path, "expanded", !node.expanded);
			return;
		}

		// Else handle key-specific behavior (i.e. everything else)
		switch (key) {
			case "github":
				window.open('https://github.com/robbwdoering/origamiodyssey', '_blank');
				break;
			default:
				console.log("unhandled navDrawer option", key);
		}

	}

	const renderNavNode = (node, nestedLevel = 0) => {
		if (!node || node.hidden) {
			return [];
		}

		// Nested component that just renders one node, with no regard for hierarchy beyond tracking nestedLevel
		const Node = ({ node, nestedLevel }) => {
			const icon = node.icon || (node.children ? (node.expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />) : null );

			return (
				<ListItem 
					className={`nested-level-${nestedLevel}`}
					key={node.key}
					button
					onClick={e => handleNavDrawerSelect(e, node.key)}
				>
					{icon && <ListItemIcon> {icon} </ListItemIcon>}
					<ListItemText> {node.text} </ListItemText>
				</ListItem>
			);
		};

		let ret = [<Node node={node} nestedLevel={nestedLevel} />];

		if (node.children && node.expanded) {
			node.children.forEach(child => {
				ret = ret.concat(renderNavNode(child, nestedLevel + 1));
			});
		};

		return ret;
	};

	return (
		<SwipeableDrawer
			anchor='left'
			classes={{
				root: styles.navDrawerRoot,
				paper: styles.navDrawerPaper
			}}
			open={showNavDrawer}
			onOpen={() => setShowNavDrawer(true)}
			onClose={() => setShowNavDrawer(false)}
		>
			<List>
				{navTreeData.reduce((acc, node) => {
					acc = acc.concat(renderNavNode(node));
					return acc;
				}, [])}
			</List>
		</SwipeableDrawer>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		showNavDrawer: state.appReducer.showNavDrawer 
	};
};

export default connect(mapStateToProps, {setShowNavDrawer})(NavDrawer);