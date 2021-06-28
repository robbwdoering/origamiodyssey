/**
 * FILENAME: ModelCard.js
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

import useStyles from './../style/theme';
import { Folds, Pages, Tags, TagCategories } from './../infra/constants';
import { setLayoutState } from './../infra/actions';
const AnimatedCard = animated(Card);

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
export const ModelCard = props => {
	const { foldEntry, name, placeholderRef, cardKey, index, isActive, isHidden, handleCardClick, layoutState, setLayoutState } = props;
	const [posHash, setPosHash] = useState(0);
	const classes = useStyles();
	const style = useRef({});

	/**
	 * Pass the click event on to the parent function to open a fold page.
	 */
	const handleFoldClick = e => {
		e.preventDefault();
		e.stopPropagation();

		openFold(cardKey);
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
	style.current = {
		height: isActive ? '400px' : '180px',
		width: isActive ? '400px' : '200px',
		display: isHidden ? 'none' : undefined
	};

	if (placeholderRef && placeholderRef.current) {
		style.current.top = placeholderRef.current.offsetTop;
		style.current.left = placeholderRef.current.offsetLeft;
	}

	if (window.innerWidth < 600 && isActive && style.current.left) {
		style.current.left = ((window.innerWidth - 400) / 2) + 'px';
	}

	// Update hash when style changes so we can inform children
	useEffect(() => setPosHash(cur => cur + 1), [style]);

	// Get the location of the current image using webpack  - probably only done once per card
	const imagePath = useMemo(
		() => (layoutState.useImages ? require(`./../static/${foldEntry.img}_thumbnail.png`) : undefined),
		[foldEntry.img, layoutState.useImages]
	);

	// This is the actual card: an `absolute` element so it can grow or shrink in place without affecting others' positioning
	return (
			<Card
				className={`${classes.modelCard} ${isActive ? classes.modelCard__active : ''}`}
				key={cardKey}
				name={index}
				onClick={event => handleCardClick(event, index)}
				style={style.current}
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
						<Button size="small" color="primary" disabled>
							Share
						</Button>
						<Button size="small" color="primary" disabled>
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
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState,
		layoutStateHash: state.appReducer.layoutState.hash
	};
};

export default connect(mapStateToProps, { setLayoutState })(ModelCard);
