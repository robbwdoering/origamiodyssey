/**
 * FILENAME: enzyme.js
 *
 * DESCRIPTION: Setup for AirBnB's Enzyme package. 
 */

import Enzyme, { configure, shallow, mount, render } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

// Spy on the authentication hook, so we can pass whatever we want
// src: https://stackoverflow.com/questions/67509953/mocking-auth0client-in-auth0-in-jest
jest.mock('@auth0/auth0-react', () => ({
    Auth0Provider: ({ children }) => children,
    withAuthenticationRequired: (component => component),
    useAuth0: () => ({
        isLoading: false,
        user: { sub: "TEST_USER" },
        isAuthenticated: true,
        loginWithRedirect: jest.fn(),
        logout: jest.fn()
    })
}));


configure({ adapter: new Adapter() });
export { shallow, mount, render };
export default Enzyme;
