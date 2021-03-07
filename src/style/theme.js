import { red } from '@material-ui/core/colors';
import { createMuiTheme, makeStyles, fade } from '@material-ui/core/styles';

// A custom theme for this app
export const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#03506f',
			dark3: '#022e40'
		},
		secondary: {
			main: '#0a043c'
		},
		error: {
			main: red.A400
		},
		background: {
			default: '#f1f4f4'
		}
	}
});

export const useStyles = makeStyles(theme => ({
	// Basic Navigation + Layout elements
	navDrawerRoot: {
		zIndex:4 
	},
	navDrawerPaper: {
		paddingTop: theme.spacing(8),
	},
	navDrawerNode0: {
		color: 'red',
		height: '200px'
	},
	navDrawerNode1: {
		color: 'red'},
	navDrawerNode2: {
		color: 'red'
	},
	bodyContainer: {
		marginTop: theme.spacing(8),
		textAlign: 'center'
	},
	centerColumn: {
		width: '100%',
		maxWidth: '1200px',
		margin: '64px auto',
		padding: "2rem",
		zIndex: 300,
		position: "relative"
	},
	sceneContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute'
	},

	// Page "main col" style 
	page_Splash: {

	},
	page_ModelSelect_container: {
		width: "100%",
		height: "100%"
	},
	page_FoldControls: {
	},
	page_User: {
	},

	// Model Cards
	modelCard: {
		position: "absolute",
	},
	modelCard__active: {
		zIndex: 300,
	},
	modelCard_title: {
		padding: "0.5rem",
		textAlign: "left",
	},
	modelCard_placeholder: {
		height: "180px",
		width: "200px",
		display: "inline-block",
		width: "200px",
		margin: "0 10px"
	},
	modelCard_rail: {
		flexGrow: 1,
		flexBasis: "50%",
		height: "100%"
	},
	modelCard_rail_container: {
		display: "flex !important",
		flexDirection: "row",
		height: "200px",
	},
	modelCard_rail_container__active: {
		height: "340px !important"
	},
	modelCard_foldButton: {
		margin: '0 0.5rem 0 auto !important'
	},
	modelCard_bodyText: {

	},
	modelCard_label: {
		textAlign: "left",
		marginBottom: "-4px"
	},

	// Header / App Bar
	appBarContainer: {
		position: 'static',
		zIndex: 3000,
		backgroundColor: '#022e40 !important'
	},
	appTitle: {
		verticalAlign: 'middle'
	},
	appLettering: {
		height: "64px !important",
		padding: "15px 0"
	},
	appLogo: {
		marginRight: "1rem"
	},
	searchContainer: {
		// position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25)
		},
		marginRight: "1rem",
		marginLeft: 'auto',
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: "auto",
			width: 'auto'
		}
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: '32px !important',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	inputRoot: {
		paddingLeft: `48px`,
	},
	inputInput: {
		color: '#ffffff',
		padding: theme.spacing(1, 20, 1, 0),
		// vertical padding + font size from searchIcon
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: '20ch'
		}
	},

	// Fold Controls
	fold_controls_container: {
		width: "100%",
		maxWidth: "200px",
		border: "1px solid red"

	},
	fold_diagrams_container: {
		width: "100%",
		border: "1px solid blue"
	},

}));

export default useStyles;
