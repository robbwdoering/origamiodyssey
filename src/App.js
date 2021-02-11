/**
 * FILENAME: App.js 
 *
 * DESCRIPTION: The most basic layout element of the application. Try to delegate as much as possible.
 */

import Body from "./layout/Body";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import './App.css';

function App() {
  return (
    <div className="app-root">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}

export default App;
