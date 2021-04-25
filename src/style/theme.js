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
		zIndex: 4
	},
	navDrawerPaper: {
		paddingTop: theme.spacing(8)
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
		// height: "100%",
		margin: '0 auto',
		padding: '2rem',
		zIndex: 300,
		position: 'relative'
	},
	sceneContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		marginTop: '-128px'
	},

	// Page "main col" style
	page_Splash: {},
	page_ModelSelect_container: {
		width: '100%',
		height: '100%'
	},
	page_FoldControls: {},
	page_User: {},

	// Model Cards
	modelCard: {
		position: 'absolute'
	},
	modelCard__active: {
		zIndex: 300
	},
	modelCard_title: {
		padding: '0.5rem',
		textAlign: 'left'
	},
	modelCard_placeholder: {
		height: '180px',
		width: '200px',
		display: 'inline-block',
		width: '200px',
		margin: '0 10px'
	},
	modelCard_rail: {
		flexGrow: 1,
		flexBasis: '50%',
		height: '100%'
	},
	modelCard_rail_container: {
		display: 'flex !important',
		flexDirection: 'row',
		height: '200px'
	},
	modelCard_rail_container__active: {
		height: '340px !important'
	},
	modelCard_foldButton: {
		margin: '0 0.5rem 0 auto !important'
	},
	modelCard_bodyText: {},
	modelCard_label: {
		textAlign: 'left',
		marginBottom: '-4px'
	},
	modelCard_img: {
		objectFit: 'contain !important'
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
		height: '64px !important',
		padding: '15px 0',
		cursor: 'pointer'
	},
	appLogo: {
		marginRight: '1rem'
	},
	searchContainer: {
		// position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25)
		},
		marginRight: '1rem',
		marginLeft: 'auto',
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: 'auto',
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
		paddingLeft: `48px`
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
	fold_controls: {
		width: 'min-content',
		position: 'absolute',
		bottom: '64px'
	},
	fold_controls_button: {
		// height: '64px',
		// width: '64px',
		alignItems: 'center',
		verticalAlign: 'middle',
		margin: '0.5rem !important'
	},
	fold_controls_button_label: {
		// flexDirection: 'column'
	},
	fold_controls_button_container: {},
	fold_controls_button_icon: {
		fontSize: '32px !important'
	},
	fold_diagrams_container: {
		width: '100%',
		border: '1px solid blue'
	},

	// Fold Editor
	editorState: {
		position: 'absolute',
		width: '400px',
		height: '25%',
		top: '10%',
		left: '20px',
		padding: '0.5rem !important'
	},
	editorDetails: {
		position: 'absolute',
		width: '400px',
		height: '60%',
		top: '37%',
		left: '20px',
		padding: '0.5rem !important'
	},
	editorEntry: {
		position: 'absolute',
		width: '500px',
		height: '87%',
		top: '10%',
		right: '20px',
		padding: '0.5rem !important'
	},
	editor_row: {
		height: '4rem'
	},
	editor_cardTitle: {
		textAlign: 'left',
		margin: '0 0 15px 5px !important'
	},
	editor_jsonTextArea: {
		height: '90%',
		width: '500px',
		marginLeft: '-0.5rem'
	},
	editor_bodyText: {
		fontSize: '1.25rem !important'
	},
	editor_floatAction: {
		position: 'absolute',
		top: '10px',
		right: '0'
	},
	editor_select: {
		width: '90%'
	},

	// Paper
	vertLabel: {
		position: 'absolute',
		zIndex: 3001,
		fontWeight: 'bold'
	},

	// Instructional Hierarchy
	hier_card: {
		position: 'absolute',
		bottom: '64px',
		left: '435px',
		zIndex: 3001
	},
	hier_expandCtrl: {
		position: 'absolute !important',
		right: '0.5rem',
		top: '0.5rem'
	},
	hier_container: {
		width: '100%',
		verticalAlign: 'top',
		padding: '7px',
		display: 'inline-flex'
	},
	hier_node_container: {
		display: 'inline-flex',
		flexDirection: 'column',
		justifyContent: 'space-evenly',
		alignItems: 'stretch',
		width: '20px',
		height: '100%'
	},
	hier_node_anchor: {},
	hier_node: {
		borderRadius: '10px',
		width: '16px',
		margin: '2px',
		cursor: 'pointer'
	},
	hier_node_spacer: {
		height: '16px'
	},
	hier_node__default: {
		backgroundColor: 'rgb(0, 0, 0, 0.05)'
	},
	hier_node__active: {
		backgroundColor: '#e3420c'
	},
	hier_node__inUse: {
		backgroundColor: '#a33612'
	},
	hier_node_tooltip: {
		zIndex: '8001 !important'
	},
	hier_node_bookend: {
		width: '100%',
		height: '16px'
	},
	hier_desc_card: {
		position: 'absolute',
		height: '200px',
		width: '400px',
		bottom: '64px',
		zIndex: 3001
	},
	hier_controls: {
		position: 'absolute',
		bottom: '274px',
		zIndex: 3001
	},

	// Model Select Filter
	filter_container: {
	},
	filter_choices: {
		marginBottom: "32px"
	},
	filter_toggle_container: {
		float: "right"
	},
	filter_clear: {
		marginTop: "-40px !important",
		marginRight: "-10px !important",
		zIndex: 2999
	},
	filter_toggle: {
	},
	filter_card: {
		width: '100%'
	},
	filter_card__active: {
	},

	tagchip: {
		margin: '2px !important'
	},
	tags__active: {
		backgroundColor: ""
	}
}));

export default useStyles;
