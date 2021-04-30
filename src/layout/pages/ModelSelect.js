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
const AnimatedCard = animated(Card);

export const ModelSelect = props => {
	const { layoutState, setLayoutState } = props;
	const classes = useStyles();

	// ----------
	// STATE INIT
	// ----------
	// Used to track each "placeholder" element
	// const [cardRefs, setCardRefs] = useState([]);

	// Used to track which card is currently open
	const [activeIndex, setActiveIndex] = useState(-1);

	// Used to track which card is currently open
	const [filterTags, setFilterTags] = useState(new Set());

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

	/**
	 * Handles a click on one of the cards - just prompts update and relies on hooks to do actual work.
	 */
	const handleCardClick = (event, index) => {
		setActiveIndex(activeIndex === index ? -1 : index);
	};

	/**
	 * Open the fold page with the supplied model name, closing this page.
	 */
	const openFold = foldKey => {
		setLayoutState({
			page: Pages.Fold,
			curFold: foldKey
		});
	};

	/**
	 * Recreate the refs array, reusing elements. Note that this algo doesn't support reordering
	 */
	// const updateCardRefs = () => {
	// 	setCardRefs(elRefs =>
	// 		Array(cardList.length)
	// 			.fill()
	// 			.map((el, i) => cardRefs[i] || createRef())
	// 	);
	// };

	/**
	 * A subcomponent that displays one card. This component needs to grow and shrink without affecting html
	 * layout styling, so it relies on a placeholder div that only suggests a shape to the actual, absolute, Card.
	 */
	const ModelCard = props => {
		const { foldEntry, name, cardKey, index, isActive, isHidden } = props;
		const [posHash, setPosHash] = useState(0);
		const ref = useRef();

		/**
		 * Pass the click event on to the parent function to open a fold page.
		 */
		const handleFoldClick = e => {
			e.preventDefault();
			e.stopPropagation();

			openFold(cardKey);
		};

		/**
		 * Sub-subcomponent to show the label for a row on this card. This probably could be abstracted out, but it
		 * doesn't seem worth it.
		 */
		const CardLabel = ({ text }) => (
			<React.Fragment>
				<Typography className={classes.modelCard_label} variant="body2" color="textSecondary" component="h4">
					{text}
				</Typography>
				<Divider />
			</React.Fragment>
		);

		// INNER LIFECYCLE

		// Dynamically calculate the target size of the card
		const style = useMemo(
			() => ({
				height: isActive ? '400px' : '180px',
				width: isActive ? '400px' : '200px',
				top: ref.current ? ref.current.offsetTop : 0,
				left: ref.current ? ref.current.offsetLeft : 0,
				display: isHidden ? 'none' : undefined
			}),
			[isActive, isHidden, ref.current && ref.current.offsetTop, ref.current && ref.current.offsetLeft]
		);

		// Update hash when style changes so we can inform children
		useEffect(() => setPosHash(cur => cur + 1), [style]);

		// Get the location of the current image using webpack  - probably only done once per card
		const imagePath = useMemo(
			() => (layoutState.useImages ? require(`./../../static/${foldEntry.img}_thumbnail.png`) : undefined),
			[foldEntry.img, layoutState.useImages]
		);

		return (
			<React.Fragment>
				{/* This is the "anchor" that positions the card, takes advantage of CSS */}
				<div
					ref={ref}
					className={classes.modelCard_placeholder}
					style={{ display: isHidden ? 'none' : undefined }}
				/>

				{/* This is the actual card: an `absolute` element so it can grow or shrink in place without affecting others' positioning */}
				<Card
					className={`${classes.modelCard} ${isActive ? classes.modelCard__active : ''}`}
					name={index}
					onClick={event => handleCardClick(event, index)}
					style={style}
				>
					<CardActionArea
						className={`${classes.modelCard_rail_container} ${
							isActive ? classes.modelCard_rail_container__active : ''
						}`}
					>
						<div className={classes.modelCard_rail}>
							{/* Picture / Preview Model */}
							<CardMedia
								className={classes.modelCard_img}
								component="img"
								alt={'Folded Model Picture'}
								title="Folded Model Picture"
								height="120"
								// image={imagePath}
								image={foldEntry.staticImg}
							/>
							<CardContent>
								{/* Title */}
								<Typography className={classes.modelCard_title} variant="h5" component="h2">
									{name}
								</Typography>

								{/* Tags */}
								{props.isActive && (
									<div className={classes.tags} variant="body2" color="textSecondary" component="p">
										{foldEntry.tags && foldEntry.tags.length
											? foldEntry.tags.map((tagKey, i) => (
													<Chip
														key={cardKey + '_' + tagKey}
														clickable
														label={Tags[tagKey].text}
														className={
															`${Tags[tagKey].category
																? classes[`tags__${Tags[tagKey].category}`]
																: undefined} ${classes.tagchip}`
														}
													/>
											  ))
											: ''}
									</div>
								)}
							</CardContent>
						</div>

						{/* Details rail */}
						{isActive && (
							<div className={classes.modelCard_rail}>
								<CardContent>
									{props.isActive && (
										<React.Fragment>
											{/* Attribution */}
											<CardLabel text="Creator" />
											<Typography
												className={classes.modelCard_bodyText}
												variant="body2"
												color="textSecondary"
												component="p"
											>
												{foldEntry.author}
											</Typography>

											<br />

											<CardLabel text="Description" />
											<Typography
												className={classes.modelCard_bodyText}
												variant="body2"
												color="textSecondary"
												component="p"
											>
												{foldEntry.description}
											</Typography>
										</React.Fragment>
									)}
								</CardContent>
							</div>
						)}
					</CardActionArea>

					{/* Actions */}
					{isActive && (
						<CardActions classes={classes.modelCard_footer}>
							<Button size="small" color="primary">
								Share
							</Button>
							<Button size="small" color="primary">
								Learn More
							</Button>
							<div className={classes.modelCard_foldButton}>
								<Button size="large" variant="contained" color="primary" onClick={handleFoldClick}>
									Fold
								</Button>
							</div>
						</CardActions>
					)}
				</Card>
			</React.Fragment>
		);
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

	// Update our list of refs for each card
	// useEffect(updateCardRefs, [cardList.length]);

	const filterIsActive = activeIndex === -2;
	const filterChoicesStyle = {
		display: filterIsActive ? undefined : 'none'
	};

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
				{cardList.map((cardKey, i) => (
					<ModelCard
						name={Folds[cardKey].name}
						key={cardKey}
						cardKey={cardKey}
						foldEntry={Folds[cardKey]}
						index={i}
						isActive={activeIndex === i}
						shouldOpenFlipped={false}
						isHidden={tagsAreHidden(Folds[cardKey], searchStr)}
					>
						<span> mainChild! </span>
					</ModelCard>
				))}
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
