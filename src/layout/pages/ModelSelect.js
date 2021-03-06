/**
 * FILENAME: ModelSelect.js
 *
 * DESCRIPTION: This page allows the user to browser through cards, read details on models, and select one to fold.
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
	Card,
	Chip
} from '@material-ui/core';

import useStyles from './../../style/theme';
import { Folds, Pages } from './../../infra/constants';
import { setLayoutState } from './../../infra/actions';
const AnimatedCard = animated(Card);

export const ModelSelect = props => {
	const { layoutState, setLayoutState } = props;
	const classes = useStyles();

	// ----------
	// STATE INIT
	// ----------
	const [cardRefs, setCardRefs] = useState([]);
	const [activeIndex, setActiveIndex] = useState(-1);

	// ----------------
	// MEMBER FUNCTIONS
	// ----------------

	const selectCardList = () => {
		return Object.keys(Folds).filter(() => true);
	};

	const handleCardClick = (event, index) => {
		setActiveIndex(activeIndex === index ? -1 : index);
	};

	const openFold = foldKey => {
		setLayoutState({
			page: Pages.Fold,
			curFold: foldKey
		})
	};

	const ModelCard = props => {
		const { foldEntry, name, cardKey, index, isActive } = props;
		const [posHash, setPosHash] = useState(0);
		const ref = useRef();

		const handleFoldClick = e => {
			e.preventDefault();	
			e.stopPropagation();

			openFold(cardKey);
		}

		const CardLabel = ({ text }) => (
			<React.Fragment>
				<Typography className={classes.modelCard_label} variant="body2" color="textSecondary" component="h4">
					{text}
				</Typography>
				<Divider />
			</React.Fragment>
		);

		const style = useMemo(
			() => ({
				height: isActive ? '400px' : '180px',
				width: isActive ? '400px' : '200px',
				top: ref.current ? ref.current.offsetTop : 0,
				left: ref.current ? ref.current.offsetLeft : 0
			}),
			[isActive, ref.current && ref.current.offsetTop, ref.current && ref.current.offsetLeft]
		);

		useEffect(() => setPosHash(cur => cur + 1), [style]);

		const imagePath = useMemo(
			() => (layoutState.useImages ? require(`./../../static/${name}.png`) : undefined),
			[name, layoutState.useImages]
		);

		const title = useMemo(() => `Folded ${name}`)

		return (
			<React.Fragment>
				{/* This is the "anchor" that positions the card, takes advantage of CSS */}
				<div ref={ref} className={classes.modelCard_placeholder} />

				{/* This is the actual card: an `absolute` element so it can grow or shrink in place without affecting others' positioning */}
				<Card
					className={`${classes.modelCard} ${isActive ? classes.modelCard__active : ''}`}
					name={index}
					onClick={event => handleCardClick(event, index)}
					style={style}
				>
					<CardActionArea className={`${classes.modelCard_rail_container} ${isActive ? classes.modelCard_rail_container__active : ""}`}>
						<div className={classes.modelCard_rail}>
							{/* Picture / Preview Model */}
							<CardMedia
								component="img"
								alt={"Folded Model Picture"}
								title="Folded Model Picture"
								height="120"
								image={imagePath}
							/>
							<CardContent>
								{/* Title */}
								<Typography
									className={classes.modelCard_title}
									variant="h5"
									component="h2"
								>
									{name}
								</Typography>

								{/* Tags */}
								{props.isActive && (
									<div className={classes.tags} variant="body2" color="textSecondary" component="p">
										{(foldEntry.tags && foldEntry.tags.length) ? 
											foldEntry.tags.map(({ name, category }, i) => (
												<Chip
													key={cardKey + "_" + name}
													clickable
													label={name}
													className={category ? classes[`tags__${category}`] : undefined}
												/>
											)) :
											""
										}
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
											<Typography className={classes.modelCard_bodyText} variant="body2" color="textSecondary" component="p">
												{foldEntry.author}
											</Typography>

											<br />

											<CardLabel text="Description" />
											<Typography className={classes.modelCard_bodyText} variant="body2" color="textSecondary" component="p">
												{foldEntry.description}
											</Typography>
										</React.Fragment>
									)}
								</CardContent>
							</div>
						)}
					</CardActionArea>
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

	const updateCardRefs = () => {
		// Recreate the refs array, reusing elements. Note that this algo doesn't support reordering
		setCardRefs(elRefs =>
			Array(cardList.length)
				.fill()
				.map((el, i) => cardRefs[i] || createRef())
		);
	};

	// ---------
	// LIFECYCLE
	// ---------

	const cardList = useMemo(selectCardList, []);

	useEffect(updateCardRefs, [cardList.length]);

	return (
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
				>
					<span> mainChild! </span>
				</ModelCard>
			))}
		</div>
	);
};

export const mapStateToProps = (state, props) => {
	return {
		layoutState: state.appReducer.layoutState
	};
};

export default connect(mapStateToProps, { setLayoutState })(ModelSelect);
