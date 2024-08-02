// // import logo from './logo.svg';
// // import './App.css';

// // function App() {
// //   return (
// //     <div className="App">
// //       <header className="App-header">
// //         <img src={logo} className="App-logo" alt="logo" />
// //         <p>
// //           Edit <code>src/App.js</code> and save to reload.
// //         </p>
// //         <a
// //           className="App-link"
// //           href="https://reactjs.org"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           Learn React
// //         </a>
// //       </header>
// //     </div>
// //   );
// // }

// // export default App;

// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Section1 from "./components/section1";
// import Section2 from "./components/section2";
// import Section3 from "./components/section3";
// import FinalPage from "./components/finalPage";
// import ConfirmationPage from "./components/ConfirmationPage";
// import UserInfoPage from "./components/UserInfoPage";

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Section1 />} />
//         <Route path="/section2" element={<Section2 />} />
//         <Route path="/section3" element={<Section3 />} />
//         <Route path="/userinfo" element={<UserInfoPage />} />
//         <Route path="/confirmation" element={<ConfirmationPage />} />
//         <Route path="/final" element={<FinalPage />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Section1 from "./components/section1";
import Section2 from "./components/section2";
import Section3 from "./components/section3";
import UserInfoPage from "./components/UserInfoPage";
import ConfirmationPage from "./components/ConfirmationPage";
import FinalPage from "./components/finalPage";

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link> {/* Link to ConfirmationPage */}
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<ConfirmationPage />} />{" "}
          {/* ConfirmationPage is now the homepage */}
          <Route path="/section1" element={<Section1 />} />
          <Route path="/section2" element={<Section2 />} />
          <Route path="/section3" element={<Section3 />} />
          <Route path="/userinfo" element={<UserInfoPage />} />
          <Route path="/final" element={<FinalPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
