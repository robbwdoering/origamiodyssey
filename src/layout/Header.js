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
import { setShowNavDrawer } from "./../infra/actions";
import useStyles from "./../style/theme.js";

export const Header = props => {
	const { setShowNavDrawer } = props;

	const [ showMenu, setShowMenu ] = useState(false);

	const styles = useStyles();
	const fold = useRef(null);

	const toggleMenu = (e) => {
		console.log("toggleMenu");
		setShowNavDrawer();
	};

	const handleClickAway = e => {
		setShowNavDrawer(false);
	}

	console.log(styles);

	return (
		<React.Fragment>
			<AppBar className={styles.appBarContainer}>
				<Toolbar>
					<IconButton edge="start" className="menu-button" color="inherit" aria-label="open drawer" onClick={toggleMenu}>
						<MenuIcon />
					</IconButton>
					<img className={styles.appLogo} height='28px' src={window.location.origin + '/logo512x256.png'} />
					<Typography className={styles.appTitle} variant="h6" noWrap>
						origami odyssey
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

export default connect(mapStateToProps, { setShowNavDrawer })(Header);
