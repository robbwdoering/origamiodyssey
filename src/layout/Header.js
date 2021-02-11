/**
 * FILENAME: Header.js
 *
 * DESCRIPTION: Renders the basic of the animation.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';

import { AppBar, ClickAwayListener, Toolbar, IconButton, Typography, Menu, MenuItem, InputBase } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';

// import OriDomi from "oridomi";

import { useStyles, theme } from "./../theme.js";

export const Header = props => {
	const {} = props;

	const [ showMenu, setShowMenu ] = useState(false);

	const styles = useStyles(theme);
	const fold = useRef(null);

	const toggleMenu = (e) => {
		console.log("toggleMenu");
		setShowMenu(showMenu ? false : e.currentTarget);
	};

	const handleClickAway = e => {
		console.log("clickAwawy")
		setShowMenu(false);
	}

	return (
		<React.Fragment>
			<AppBar position="static" className="header">
				<Toolbar>
					<IconButton edge="start" className="menu-button" color="inherit" aria-label="open drawer" onClick={toggleMenu}>
						<MenuIcon />
					</IconButton>
					<Typography className="app-title" variant="h6" noWrap>
						Origami Odyssey
					</Typography>
					<div className={styles.searchContainer}>
						<div className={styles.searchIcon}>
							<SearchIcon />
						</div>
						<InputBase
							placeholder="Search Models…"
							classes={{root: styles.inputRoot, input: styles.inputInput }}
							inputProps={{ 'aria-label': 'search' }}
						/>
					</div>
				</Toolbar>
			</AppBar>
			<Menu
				elevation={0}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				anchorEl={showMenu}
				open={Boolean(showMenu)}
				keepMounted
				onClose={toggleMenu}
			>
					<MenuItem> A Menu without options </MenuItem>
					<MenuItem> is no menu at all </MenuItem>
			</Menu>
		</React.Fragment>
	);
};

export const mapStateToProps = (state, props) => {
	return {};
};

export default connect(mapStateToProps, {})(Header);
