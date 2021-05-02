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
		textAlign: 'center',
		zIndex: 299
	},
	centerColumn: {
		width: '100%',
		maxWidth: '1200px',
		// height: "100%",
		margin: '0 auto',
		padding: '32px',
		zIndex: 300,
		position: 'relative',
		pointerEvents: 'none'
	},
	centerColumn_flex: {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "row",
		zIndex: 300,
		alignItems: "flex-end",
		pointerEvents: 'none'
	},
	sceneContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		marginTop: '-128px'
		// zIndex: 401
	},

	// Page "main col" style
	page_Splash: {},
	page_ModelSelect_container: {
		width: '100%',
		height: '100%',
		pointerEvents: 'all'
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
		pointerEvents: 'all',
		margin: '0 2.5% !important',
		zIndex: 402
	},
	fold_controls_button_label: {
		fontSize: '1rem'
	},
	fold_controls_button_label_large: {
		fontSize: '2rem'
	},
	fold_controls_button_container: {
		textAlign: "right",
		flexGrow: 1
	},
	fold_controls_button_icon: {
		fontSize: '32px !important'
	},
	fold_controls_button_icon_large: {
		fontSize: '64px !important'
	},
	fold_diagrams_container: {
		width: '100%',
		border: '1px solid blue'
	},
	fold_timer_container: {
		position: 'absolute',
		top: '14px',
		right: '0px',
		pointerEvents: 'all'
	},
	fold_timer_control: {
	},
	fold_timer_snackbar: {
		pointerEvents: 'all',
		backgroundColor: "#e3420c",
		marginTop: '64px !important'
	},
	fold_timer_snackbar_close: {
		float: 'right'
	},
	fold_timer: {
	},
	fold_timer__paused: {
	},
	fold_timer_grid: {
		width: '100%'
	},
	likert_icon_container: {
		backgroundColor: 'blue'
	},
	likert_icon: {
		backgroundColor: 'red'
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
		padding: '0.5rem !important',
		zIndex: 301
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
	editor_details_expand: {
		position: 'absolute !important',
		top: '12px',
		right: '7px',
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
		pointerEvents: 'all',
		zIndex: 2999
	},
	hier_expandCtrl: {
		position: 'absolute !important',
		right: '0.5rem',
		top: '0.5rem'
	},
	hier_container: {
		width: '100%',
		height: '264px',
		verticalAlign: 'top',
		padding: '0 7px',
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
	hier_node_container_anchor: {
		position: "absolute",
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
		pointerEvents: 'all',
		height: '200px',
		width: '400px',
		zIndex: 402,
		overflow: 'visible !important'
	},
	hier_looper_rail: {
		width: '100%',
		textAlign: 'left'
	},
	hier_looper_container: {
		zIndex: 402,
		width: '400px',
		top: '-10px',
		height: '10px',
		display: 'flex'
	},
	hier_looper_item: {
		height: '5px',
		borderRadius: "2.5px",
		flexGrow: 1,
		margin: "0 2px !important"
	},
	hier_looper_item__active: {
		backgroundColor: '#a33612',
	},
	hier_controls: {
		// zIndex: 3001
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
		width: '100%',
		pointerEvents: 'all'
	},
	filter_card__active: {
	},

	tagchip: {
		margin: '2px !important'
	},
	tags__active: {
		backgroundColor: ""
	},

	// The user page
	user_container: {
		pointerEvents: 'all'
	},
	user_profile: {
		padding: "0.5rem"
	},
	user_pref: {
		padding: "0.5rem"
	},
	user_assistant: {
		padding: "0.5rem"
	},
	user_add_model_button: {
		float: "right"
	},
	user_models_header: {
		color: "$"
	},
	slimCol: {
		maxWidth: "15rem"
	}
}));

export default useStyles;
