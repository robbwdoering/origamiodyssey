/**
 * FILENAME: index.js
 *
 * DESCRIPTION: Root of the application - put providers, routers, auth, etc. here.
 */

/* Node Modules */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { CookiesProvider } from 'react-cookie';

/* Local Modules */
import { appReducer } from './infra/appReducer';
import { theme } from './style/theme';
import Header from './layout/Header';
import Body from './layout/Body';
import Footer from './layout/Footer';
import NavDrawer from './layout/NavDrawer';

/* Source (this package) */
// import * as serviceWorker from './serviceWorker';
import './index.css';

// Create redux store
const rootReducer = combineReducers({
	appReducer: appReducer
});
const store = createStore(rootReducer);

render(
	/* React-redux provider - centralizes state */
	<Provider store={store}>

		{/* Allows us to store redux state in cookies for smooth refresh behavior */}
		<CookiesProvider>

			{/* Material-ui theme controls pallette, global styles */}
			<ThemeProvider theme={theme}>
				<CssBaseline />

				{/* The Actual App */}
				<div className="app-root">

					{/* Logo, search, nav-bar access */}
					<Header />

					{/* Obviously navigation, but also all other "settings"-esque options */}
					<NavDrawer />

					{/* Main body of the app - copy & animations */}
					<Body />

					{/* TBD */}
					<Footer />
				</div>
			</ThemeProvider>
		</CookiesProvider>
	</Provider>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
