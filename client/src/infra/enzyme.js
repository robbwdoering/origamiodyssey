/**
 * FILENAME: enzyme.js
 *
 * DESCRIPTION: Setup for AirBnB's Enzyme package. 
 */

import Enzyme, { configure, shallow, mount, render } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });
export { shallow, mount, render };
export default Enzyme;
