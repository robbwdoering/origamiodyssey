/**
 * FILENAME: ModelSelect.js
 *
 * DESCRIPTION: This page allows the user to browse through cards, read details on models, and select one to fold.
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config } from 'react-spring';

import {
	Divider,
	Typography,
	CardMedia,
	CardActionArea,
	CardActions,
	CardContent,
	Button,
	Grid,
	Fab,
	Card,
	Chip
} from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';
import Clear from '@material-ui/icons/Clear';

import useStyles from './../../style/theme';
import { Folds, Pages, Tags, TagCategories } from './../../infra/constants';
import { setLayoutState } from './../../infra/actions';
import ModelCardContainer from './ModelCard';
const AnimatedCard = animated(Card);

export const ModelSelect = props => {
	const { layoutState, setLayoutState } = props;
	const classes = useStyles();

	// ----------
	// STATE INIT
	// ----------
	// Used to track which card is currently open
	const [activeIndex, setActiveIndex] = useState(-1);

	// Used to track which card is currently open
	const [filterTags, setFilterTags] = useState(new Set());

	const [curHash, setHash] = useState(0);

	const cardRefs = useRef(Object.keys(Folds).map(() => createRef()));

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------

	/**
	 * Reads the list of all cards, and decides which to include.
	 * Note that this is likely to grow suddenly and quickly in complexity as soon as we start
	 * including folds from other sources, or, god forbid, external REST sources.
	 * @return an array of Fold objects - see constants.js for format
	 */
	const filterCardList = () => {
		return Object.keys(Folds).filter(() => true);
	};

	const triggerRerender = () => {
		setHash(cur => cur + 1);
	};

	/**
	 * Handles a click on one of the cards - just prompts update and relies on hooks to do actual work.
	 */
	const handleCardClick = (event, index) => {
		setActiveIndex(activeIndex === index ? -1 : index);

		// TODO - redo this whole thing with React Portals
		setTimeout(() => triggerRerender(), 50);
	};

	const generateFilterCardStyle = () => {
		const isActive = activeIndex === -2;
		return {
			height: isActive ? 'min-content' : '64px'
		};
	};

	const handleFilterTagClick = tagKey => {
		let newFilterTags = new Set(filterTags);

		if (newFilterTags.has(tagKey)) {
			newFilterTags.delete(tagKey);
		} else {
			newFilterTags.add(tagKey);
		}

		setFilterTags(newFilterTags);
	};

	const tagsAreHidden = (obj, searchStr) => {
		let ret = false;
		if (filterTags.size) {
			// If there's filters and this doesn't match, hide it
			ret = ret || !obj.tags.some(tagKey => filterTags.has(tagKey));
		}
		if (searchStr.length) {
			// If there's a search str and this doesn't match, hide it
			ret =
				ret ||
				!(obj.name.toLowerCase().includes(searchStr) || obj.description.toLowerCase().includes(searchStr));
		}
		// console.log('tagsAreHidden', ret, searchStr, obj);

		return ret;
	};

	// ---------
	// LIFECYCLE
	// ---------
	// Get the list of all cards to display
	const cardList = useMemo(filterCardList, []);

	const filterCardStyle = useMemo(generateFilterCardStyle, [window.innerWidth, activeIndex]);
	const searchStr = useMemo(() => layoutState.searchStr.toLowerCase(), [layoutState.searchStr]);

	const filterIsActive = activeIndex === -2;
	const filterChoicesStyle = {
		display: filterIsActive ? undefined : 'none'
	};

	// 	

	console.log("[ModelSelect] ", cardList.length, cardList, activeIndex);

	return (
		<React.Fragment>
			<div
				className={`${classes.filter_card} ${activeIndex === -2 ? classes.filter_card__active : ''}`}
				style={filterCardStyle}
			>
				<div className={classes.filter_toggle_container}>
					{filterTags.size > 0 && (
						<Fab
							className={classes.filter_clear}
							onClick={() => setFilterTags(new Set())}
							size="small"
						>
							<Clear />
						</Fab>
					)}
					<Fab
						className={classes.filter_toggle}
						onClick={e => handleCardClick(e, -2)}
						color="primary"
						size="large"
						variant="extended"
					>
						<FilterList />
						Filter
					</Fab>
				</div>
				<Grid container className={classes.filter_choices} style={filterChoicesStyle}>
					{Object.keys(TagCategories).map(categoryKey => (
						<Grid item className={classes.editor_row} {...TagCategories[categoryKey]}>
							{/* Title */}
							<Typography
								className={classes.modelCard_label}
								variant="body2"
								color="textSecondary"
								component="h4"
							>
								{TagCategories[categoryKey].text}
							</Typography>
							<Divider />

							{Object.keys(Tags)
								.filter(tagKey => Tags[tagKey].category === categoryKey)
								.map(tagKey => (
									<Chip
										key={tagKey}
										clickable
										label={Tags[tagKey].text}
										onClick={() => handleFilterTagClick(tagKey)}
										color={filterTags.has(tagKey) ? 'primary' : undefined}
										classes={{
											root: `${classes.tagchip}`
										}}
									/>
								))}
						</Grid>
					))}
				</Grid>
			</div>

			<div className={classes.page_ModelSelect_container}>
				{cardList.map((cardKey, i) => {
					const isHidden = tagsAreHidden(Folds[cardKey], searchStr);
					return (
						<React.Fragment key={cardKey}>
							{/* This is the "anchor" that positions the card, takes advantage of CSS */}
							<div
								ref={cardRefs.current[i]}
								className={classes.modelCard_placeholder}
								style={{ display: isHidden ? 'none' : undefined }}
							/>
							<ModelCardContainer
								placeholderRef={cardRefs.current[i]} 
								name={Folds[cardKey].name}
								cardKey={cardKey}
								foldEntry={Folds[cardKey]}
								index={i}
								isActive={activeIndex === i}
								shouldOpenFlipped={false}
								isHidden={isHidden}
								handleCardClick={handleCardClick}
							/>
						</React.Fragment>
					);
				})}
			</div>
		</React.Fragment>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash
	};
};

export default connect(mapStateToProps, { setLayoutState })(ModelSelect);
