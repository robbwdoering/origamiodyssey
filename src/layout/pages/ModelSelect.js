/**
 * FILENAME: ModelSelect.js 
 *
 * DESCRIPTION: This page allows the user to browser through cards, read details on models, and select one to fold. 
 */

// React + Redux
import React, { useState, useRef, useMemo, useEffect, createRef } from 'react';
import { connect } from 'react-redux';

import { useUpdate, useSpring, useSprings, animated, config }  from 'react-spring';

import { SwipeableDrawer, Typography, CardMedia, CardActionArea, CardActions, CardContent, Button, List, Divider, ListItem, Card, Grid } from '@material-ui/core';

import useStyles from "./../../style/theme";
import { Folds } from "./../../infra/constants";
const AnimatedCard = animated(Card);

export const ModelSelect = () => {
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
	}

	const ModelCard = props => {
		const { name, index, isActive } = props;
		const [posHash, setPosHash] = useState(0);
		const ref = useRef();

		const style = useMemo(() => ({
			height: isActive ? "400px" : "180px",
			width: isActive ? "400px" : "200px",
			top: ref.current ? ref.current.offsetTop : 0,
			left: ref.current ? ref.current.offsetLeft : 0,
		}), [isActive, ref.current && ref.current.offsetTop, ref.current && ref.current.offsetLeft]);

		useEffect(() => setPosHash(cur => cur + 1), [style])

		// console.log(ref.current)

		return (
			<React.Fragment>
				<div ref={ref} className={classes.modelCard_placeholder} />
				<Card
					className={`${classes.modelCard} ${isActive ? classes.modelCard__active : ""}`}
					name={index}
					onClick={event => handleCardClick(event, index)}
					style={style}
				>
					<CardActionArea className={classes.modelCard_rail__container}>
						<div className={classes.modelCard_rail} >
							<CardMedia
							component="img"
							alt="Folded Model Picture"
							title="Folded Model Picture"
							height="120"
							image="/static/images/cards/contemplative-reptile.jpg"
							/>
							<CardContent>
								<Typography className={classes.modelCard_title} gutterBottom variant="h5" component="h2">
									{name}
								</Typography>
								{props.isActive && (
									<Typography className=""variant="body2" color="textSecondary" component="p">
										Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
										across all continents except Antarctica
									</Typography>
								)}
							</CardContent>
						</div>
						{isActive && (
							<div className={classes.modelCard_rail} >
								<CardContent>
									{props.isActive && (
										<Typography className=""variant="body2" color="textSecondary" component="p">
											Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
											across all continents except Antarctica
										</Typography>
									)}
								</CardContent>
							</div>
						)}
					</CardActionArea>
					{isActive && (
						<CardActions>
							<Button size="small" color="primary">
								Share
							</Button>
							<Button size="small" color="primary">
								Learn More
							</Button>
							<div className={classes.modelCard_foldButton} >
							<Button size="Large" variant="contained" color="primary">
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
		setCardRefs(elRefs => (
			Array(cardList.length).fill().map((el, i) => cardRefs[i] || createRef())
		));
	};

	// ---------
	// LIFECYCLE
	// ---------

	const cardList = useMemo(selectCardList, []);

	useEffect(updateCardRefs, [cardList.length]);

    return (
        <div className={classes.page_ModelSelect_container}>
        	{cardList.map((cardName, i) => (
        		<ModelCard
	        		name={cardName}
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
	};
};

export default connect(mapStateToProps, {})(ModelSelect);

