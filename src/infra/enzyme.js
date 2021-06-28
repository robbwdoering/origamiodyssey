/**
 * FILENAME: enzyme.js
 *
 * DESCRIPTION: Setup for AirBnB's Enzyme package. 
 */

import Enzyme, { configure, shallow, mount, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
export { shallow, mount, render };
export default Enzyme;
