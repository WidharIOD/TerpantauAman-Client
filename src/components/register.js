// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { setDoc, doc } from "firebase/firestore";
// import { auth, db } from "../firebaseConfig";

// const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [companyName, setCompanyName] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Basic validation (you'll likely want more robust validation)
//     if (companyName.trim() === "") {
//       alert("Please enter a company name.");
//       return;
//     }

//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       // Save user data to Firestore using company name as the document ID
//       await setDoc(doc(db, "users", companyName), {
//         uid: user.uid,
//         email: user.email,
//         companyName, // Include the company name
//       });

//       navigate("/setup");
//     } catch (error) {
//       console.error("Error registering:", error);
//       // Handle specific errors, e.g., email already in use
//       if (error.code === "auth/email-already-in-use") {
//         alert("Email address is already in use.");
//       } else {
//         alert(error.message);
//       }
//     }
//   };

//   return (
//     <div>
//       <h1>Register</h1>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label htmlFor="companyName">Company Name:</label>
//           <input
//             type="text"
//             id="companyName"
//             value={companyName}
//             onChange={(e) => setCompanyName(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           {" "}
//           {/* Input field for email */}
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
//           {" "}
//           {/* Input field for password */}
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Register</button>
//       </form>

//       <p>
//         Already have an account? <Link to="/login">Login</Link>
//       </p>
//     </div>
//   );
// };

// export default RegisterPage;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (companyName.trim() === "") {
      alert("Please enter a company name.");
      return;
    }

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        companyName,
      });

      // Automatically log the user in after registration
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/setup");
    } catch (error) {
      console.error("Error registering:", error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="companyName">Company Name:</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div>
          {" "}
          {/* Input field for email */}
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
          {" "}
          {/* Input field for password */}
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* ... input fields for companyName, email, and password ... */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
