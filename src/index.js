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

/* Local Modules */
import { appReducer } from './infra/appReducer';
import { theme } from "./style/theme";
import Header from "./layout/Header";
import Body from "./layout/Body";
import Footer from "./layout/Footer";
import NavDrawer from "./layout/NavDrawer";

/* Source (this package) */
// import * as serviceWorker from './serviceWorker';
import './index.css';

// Create redux store
const rootReducer = combineReducers({
	appReducer: appReducer
})
const store = createStore(rootReducer);

render(
	(
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				
				{/* The Actual App */}
				<div className="app-root">
				    <Header />
				    <NavDrawer />
				    <Body />
				    <Footer />
			    </div>
			</ThemeProvider>
		</Provider>
	),
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
