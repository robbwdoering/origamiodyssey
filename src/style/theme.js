import { red } from '@material-ui/core/colors';
import { createMuiTheme, makeStyles, fade } from '@material-ui/core/styles';

// A custom theme for this app
export const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#03506f'
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
	appBarContainer: {
		position: 'static',
		zIndex: 3000,
	},
	appTitle: {
		verticalAlign: 'middle'
	},
	appLogo: {

	},
	searchContainer: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25)
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto'
		}
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	inputRoot: {
		color: 'inherit',
		paddingLeft: `48px`,
	},
	inputInput: {
		padding: theme.spacing(1, 20, 1, 0),
		// vertical padding + font size from searchIcon
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: '20ch'
		}
	},
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
		color: 'red'
	},
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
		padding: "2rem"
	},
	sceneContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute'
	},
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
	},
	modelCard_rail__container: {
		display: "flex !important",
		flexDirection: "row"
	},
	modelCard_foldButton: {
		float: 'right'
	}
}));

export default useStyles;
