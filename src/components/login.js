// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebaseConfig";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate("/home");
//     } catch (error) {
//       console.error("Error logging in:", error);
//       alert(error.message);
//     }
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label htmlFor="email">Email:</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Login</button>
//       </form>{" "}
//
//       <p>
//         Don't have an account? <Link to="/register">Register</Link>
//       </p>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { auth } from "../firebaseConfig";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   // Clear any previous errors

  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //     navigate("/home");
  //   } catch (error) {
  //     console.error("Error logging in:", error);
  //     setError(error.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const idToken = await getIdToken(user);

      // Make a request to the backend to set the token in a cookie or session
      await fetch("http://localhost:3001/set-auth-token", {
        // Replace with your actual backend endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
      });

      navigate("/home");
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.message);
    }
  };
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}{" "}
        {/* Display error message */}
        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;
