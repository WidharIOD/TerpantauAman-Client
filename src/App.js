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

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Section1 from "./components/section1";
import Section2 from "./components/section2";
import Section3 from "./components/section3";
import UserInfoPage from "./components/UserInfoPage";
import ConfirmationPage from "./components/ConfirmationPage";
import FinalPage from "./components/finalPage";
import ProjectSetupPage from "./components/projectSetupPage";
import LoginPage from "./components/login";
import RegisterPage from "./components/register";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false); // Set loading to false after auth state is determined
    });

    return () => unsubscribe();
    // Clean up the listener on unmount
  }, []);

  // Function to create a ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>; // Show a loading message while checking auth state
    }
    if (!user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };
  // Redirect to setup if project setup is not complete
  const RedirectToSetup = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (user && !isProjectSetupComplete(user)) {
      // Check if project setup is done (you'll need to implement this function)
      return <Navigate to="/setup" replace />;
    }
    return children;
  };

  // Placeholder function to check if project setup is complete
  // You'll need to implement the actual logic based on your Firestore data
  const isProjectSetupComplete = (user) => {
    // Example: Check if a "project_setups" document exists for the user's UID
    // You'll likely need to fetch this data from Firestore
    return false; // Replace with your actual logic
  };

  // New component to handle redirection for authenticated users
  const RedirectIfAuthenticated = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (!user) {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div>
        {/* <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>{" "}
            {user && (
              <li>
                <Link to="/home">Reports</Link>
              </li>
            )}{" "}
            {user && (
              <li>
                <Link to="/section1">Add Report</Link>
              </li>
            )}
            {!user && (
              <li>
                <Link to="/register">Register</Link>
              </li>
            )}
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/setup"
            element={
              <RedirectIfAuthenticated>
                <ProjectSetupPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/home"
            element={
              <RedirectIfAuthenticated>
                <ConfirmationPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/section1"
            element={
              <RedirectIfAuthenticated>
                <Section1 />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/section2"
            element={
              <RedirectIfAuthenticated>
                <Section2 />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/section3"
            element={
              <RedirectIfAuthenticated>
                <Section3 />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/userinfo"
            element={
              <RedirectIfAuthenticated>
                <UserInfoPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/final"
            element={
              <RedirectIfAuthenticated>
                <FinalPage />
              </RedirectIfAuthenticated>
            }
          />
          {/* ... other routes, also wrap them in ProtectedRoute if needed ... */}
        </Routes>
      </div>
    </Router>
  );
};

//   return (
//     <Router>
//       <div>
//         <nav>
//           <ul>
//             <li>
//               <Link to="/home">Home</Link> {/* Link to ConfirmationPage */}
//             </li>
//             <li>
//               <Link to="/">Go To setup</Link> {/* Link to ConfirmationPage */}
//             </li>
//           </ul>
//         </nav>
//         <Routes>
//           <Route path="/" element={<LoginPage />} />{" "}
//           {/* LoginPage is now the homepage */}
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/setup" element={<ProjectSetupPage />} />{" "}
//           {/* ProjectSetupPage is now the homepage */}
//           <Route path="/home" element={<ConfirmationPage />} />{" "}
//           {/* ConfirmationPage is now the homepage */}
//           <Route path="/section1" element={<Section1 />} />
//           <Route path="/section2" element={<Section2 />} />
//           <Route path="/section3" element={<Section3 />} />
//           <Route path="/userinfo" element={<UserInfoPage />} />
//           <Route path="/final" element={<FinalPage />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

export default App;
