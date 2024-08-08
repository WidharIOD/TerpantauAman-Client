// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { addDoc, doc, setDoc, collection, getDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from "../firebaseConfig";

// const UserInfoPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const fileData = location.state || {};

//   const {
//     dimensions,
//     metric,
//     refreshTime,
//     isEditing,
//     reportName: initialReportName,
//     id: initialReportId,
//     resultId: initialResultId,
//   } = fileData;

//   console.log(fileData);

//   const [reportName, setReportName] = useState(initialReportName || "");
//   const [isLoading, setIsLoading] = useState(false);
//   const [projectSetupData, setProjectSetupData] = useState(null); // To store fetched project setup data

//   useEffect(() => {
//     // Fetch project setup details from Firestore
//     const fetchProjectSetup = async () => {
//       try {
//         const user = getAuth().currentUser;
//         if (user) {
//           const userDocRef = doc(db, "users", user.uid);
//           const userDocSnap = await getDoc(userDocRef);
//           if (userDocSnap.exists()) {
//             const companyName = userDocSnap.data().companyName;
//             const projectSetupDocRef = doc(db, "project_setups", user.uid);
//             const projectSetupDocSnap = await getDoc(projectSetupDocRef);
//             if (projectSetupDocSnap.exists()) {
//               setProjectSetupData(projectSetupDocSnap.data());
//             } else {
//               console.log("Project setup document not found!");
//               // Handle this case appropriately (e.g., redirect to ProjectSetupPage)
//             }
//           } else {
//             console.log("User document not found!");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching project setup:", error);
//       }
//     };

//     fetchProjectSetup();
//     if (isEditing && initialReportId) {
//       const fetchData = async () => {
//         try {
//           const docRef = doc(db, "Live Report", initialReportId);
//           const docSnap = await getDoc(docRef);
//           if (docSnap.exists()) {
//             const reportData = docSnap.data();
//             setReportName(reportData.reportName);
//           } else {
//             console.log("No such document!");
//           }
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       fetchData();
//     }
//   }, [isEditing, initialReportId]);

//   const handleSubmit = async () => {
//     if (!metric) return;
//     if (reportName.trim() === "") {
//       alert("Please enter your name.");
//       return;
//     }

//     setIsLoading(true);
//     const currentDateTime = new Date().toLocaleString("en-GB", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false,
//     });

//     try {
//       const res = await fetch("http://localhost:3001/query-bigquery", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           dimensions,
//           metric,
//           refreshTime,
//           projectId: projectSetupData.projectId, // Include from Firestore
//           datasetId: projectSetupData.datasetId,
//           tableId: projectSetupData.tableId,
//           serviceAccount: projectSetupData.serviceAccount,
//         }),
//       });

//       const bigqueryData = await res.json();

//       const resultsData = {
//         results: bigqueryData,
//         timestamp: currentDateTime,
//         dateLastRun: currentDateTime,
//       };
//       let resultDocRef;

//       if (isEditing) {
//         // Update existing "report_results" document
//         resultDocRef = doc(db, "Report Result", fileData.resultId);
//         await setDoc(resultDocRef, resultsData, { merge: true });

//         // Update existing "Live Report" document
//         const liveReportDocRef = doc(db, "Live Report", initialReportId);
//         await setDoc(
//           liveReportDocRef,
//           {
//             reportName,
//             dimensions,
//             metric,
//             refreshTime,
//             timestamp: currentDateTime,
//             dateLastRun: currentDateTime,
//             // resultId remains the same since we're updating the existing report
//           },
//           { merge: true }
//         );
//       } else {
//         // Create new Report Result document
//         const resultsCollection = collection(db, "Report Result");
//         const resultDocRef = await addDoc(resultsCollection, resultsData);

//         // Create new Live Report document
//         const liveReportData = {
//           reportName,
//           dimensions,
//           metric,
//           refreshTime,
//           timestamp: currentDateTime,
//           dateLastRun: currentDateTime,
//           resultId: resultDocRef.id,
//         };
//         const liveReportsCollection = collection(db, "Live Report");
//         await addDoc(liveReportsCollection, liveReportData);
//       }

//       navigate("/home", { state: resultsData });
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>User Information</h1>
//       <label htmlFor="reportName">Enter your name:</label>
//       <input
//         type="text"
//         id="reportName"
//         value={reportName}
//         onChange={(e) => setReportName(e.target.value)}
//         readOnly={isEditing}
//       />
//       <button onClick={handleSubmit} disabled={isLoading}>
//         {isLoading ? "Processing..." : "Proceed to Results"}
//       </button>
//     </div>
//   );
// };

// export default UserInfoPage;

// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from "../firebaseConfig";
// import "../style/Section4.css";
// import FormHeader from "./FormHeader/FormHeader";

// const UserInfoPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     dimensions,
//     metric,
//     refreshTime,
//     isEditing,
//     reportName: initialReportName,
//     reportId: initialReportId,
//   } = location.state || {};

//   const [reportName, setReportName] = useState(initialReportName || "");
//   const [isLoading, setIsLoading] = useState(false);
//   const [projectSetupData, setProjectSetupData] = useState(null);

//   useEffect(() => {
//     // Fetch project setup details from Firestore (same logic as before)
//     const fetchProjectSetup = async () => {
//       try {
//         const user = getAuth().currentUser;
//         if (user) {
//           const userDocRef = doc(db, "users", user.uid);
//           const userDocSnap = await getDoc(userDocRef);
//           if (userDocSnap.exists()) {
//             const companyName = userDocSnap.data().companyName;
//             const projectSetupDocRef = doc(db, "project_setups", user.uid);
//             const projectSetupDocSnap = await getDoc(projectSetupDocRef);
//             if (projectSetupDocSnap.exists()) {
//               setProjectSetupData(projectSetupDocSnap.data());
//             } else {
//               console.log("Project setup document not found!");
//               // Handle this case appropriately (e.g., redirect to ProjectSetupPage)
//             }
//           } else {
//             console.log("User document not found!");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching project setup:", error);
//       }
//     };

//     fetchProjectSetup();

//     if (isEditing && initialReportId) {
//       const fetchData = async () => {
//         try {
//           const docRef = doc(db, "Live Report", initialReportId);
//           const docSnap = await getDoc(docRef);
//           if (docSnap.exists()) {
//             const reportData = docSnap.data();
//             setReportName(reportData.reportName);
//           } else {
//             console.log("No such document!");
//           }
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       fetchData();
//     }
//   }, [isEditing, initialReportId]);

//   const handleSubmit = async () => {
//     if (!metric || metric.length === 0) return; // Don't fetch if no metric is selected
//     if (reportName.trim() === "") {
//       alert("Please enter a report name.");
//       return;
//     }

//     setIsLoading(true);
//     const currentDateTime = new Date().toLocaleString("en-GB", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false,
//     });

//     try {
//       // Fetch data from BigQuery
//       const res = await fetch("http://localhost:3001/query-bigquery", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           dimensions,
//           metric,
//           refreshTime,
//           projectId: projectSetupData.projectId,
//           datasetId: projectSetupData.datasetId,
//           tableId: projectSetupData.tableId,
//           serviceAccount: projectSetupData.serviceAccount,
//         }),
//       });

//       const bigqueryData = await res.json();

//       const resultsData = {
//         results: bigqueryData,
//         timestamp: currentDateTime,
//         dateLastRun: currentDateTime,
//       };

//       let resultDocRef;

//       if (isEditing && initialReportId) {
//         // Update existing "report_results" document
//         resultDocRef = doc(db, "Report Result", location.state.resultId);
//         await setDoc(resultDocRef, resultsData, { merge: true });

//         // Update existing "Live Report" document
//         const liveReportDocRef = doc(db, "Live Report", initialReportId);
//         await setDoc(
//           liveReportDocRef,
//           {
//             reportName,
//             dimensions,
//             metric,
//             refreshTime,
//             timestamp: currentDateTime,
//             dateLastRun: currentDateTime,
//           },
//           { merge: true }
//         );
//       } else {
//         // Create new documents in both collections
//         const resultsCollection = collection(db, "Report Result");
//         resultDocRef = await addDoc(resultsCollection, resultsData);

//         // Save to "Live Report" collection with the resultId
//         const liveReportData = {
//           reportName,
//           dimensions,
//           metric,
//           refreshTime,
//           timestamp: currentDateTime,
//           dateLastRun: currentDateTime,
//           resultId: resultDocRef.id,
//         };
//         await addDoc(collection(db, "Live Report"), liveReportData);
//       }

//       // Navigate to ConfirmationPage
//       navigate("/home", { state: { ...resultsData } });
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <FormHeader activeStep={3} />
//       <div className="container">
//         <h3 className="title">Confirmation Page</h3>
//         <div className="form-group">
//           <label htmlFor="reportName">Report Name:</label>
//           <input
//             type="text"
//             id="reportName"
//             className="report-name-input"
//             value={reportName}
//             onChange={(e) => setReportName(e.target.value)}
//             readOnly={isEditing}
//           />
//         </div>
//         <div className="summary">
//           <h4>Selected Dimensions:</h4>
//           <ul>
//             {dimensions.map((dimension, index) => (
//               <li key={index}>{dimension}</li>
//             ))}
//           </ul>
//           <h4>Selected Metrics:</h4>
//           <ul>
//             {metric.map((metric, index) => (
//               <li key={index}>{metric}</li>
//             ))}
//           </ul>
//           <h4>Selected Refresh Time:</h4>
//           <p>{refreshTime}</p>
//         </div>
//         <div className="submit-button-container">
//           <button
//             className="submit-button"
//             onClick={handleSubmit}
//             disabled={isLoading}
//           >
//             {isLoading ? "Processing..." : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfoPage;

// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from "../firebaseConfig";
// import "../style/Section4.css";
// import FormHeader from "./FormHeader/FormHeader";
// import { v4 as uuidv4 } from "uuid";

// const UserInfoPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     dimensions,
//     metric,
//     refreshTime,
//     isEditing,
//     reportName: initialReportName,
//     reportId: initialReportId,
//   } = location.state || {};

//   const [reportName, setReportName] = useState(initialReportName || "");
//   const [isLoading, setIsLoading] = useState(false);
//   const [projectSetupData, setProjectSetupData] = useState(null);

//   useEffect(() => {
//     const fetchProjectSetup = async () => {
//       try {
//         const user = getAuth().currentUser;
//         if (user) {
//           const userDocRef = doc(db, "users", user.uid);
//           const userDocSnap = await getDoc(userDocRef);
//           if (userDocSnap.exists()) {
//             const companyName = userDocSnap.data().companyName;
//             const projectSetupDocRef = doc(db, "project_setups", user.uid);
//             const projectSetupDocSnap = await getDoc(projectSetupDocRef);
//             if (projectSetupDocSnap.exists()) {
//               setProjectSetupData(projectSetupDocSnap.data());
//             } else {
//               console.log("Project setup document not found!");
//             }
//           } else {
//             console.log("User document not found!");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching project setup:", error);
//       }
//     };

//     fetchProjectSetup();

//     if (isEditing && initialReportId) {
//       const fetchData = async () => {
//         try {
//           const docRef = doc(db, "Live Report", initialReportId);
//           const docSnap = await getDoc(docRef);
//           if (docSnap.exists()) {
//             const reportData = docSnap.data();
//             setReportName(reportData.reportName);
//           } else {
//             console.log("No such document!");
//           }
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };
//       fetchData();
//     }
//   }, [isEditing, initialReportId]);

//   const handleSubmit = async () => {
//     if (!metric || metric.length === 0) return;
//     if (reportName.trim() === "") {
//       alert("Please enter a report name.");
//       return;
//     }

//     setIsLoading(true);
//     const currentDateTime = new Date().toLocaleString("en-GB", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false,
//     });

//     try {
//       const res = await fetch("http://localhost:3001/query-bigquery", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           dimensions,
//           metric,
//           refreshTime,
//           projectId: projectSetupData.projectId,
//           datasetId: projectSetupData.datasetId,
//           tableId: projectSetupData.tableId,
//           serviceAccount: projectSetupData.serviceAccount,
//         }),
//       });

//       const bigqueryData = await res.json();

//       const user = getAuth().currentUser;
//       const userDocRef = doc(db, "users", user.uid);
//       const userDocSnap = await getDoc(userDocRef);
//       const companyName = userDocSnap.data().companyName;

//       const newCollectionId = `${companyName}-${uuidv4()}`;
//       const resultsCollection = collection(db, newCollectionId);

//       for (const row of bigqueryData) {
//         await addDoc(resultsCollection, row);
//       }

//       const liveReportData = {
//         reportName,
//         dimensions,
//         metric,
//         refreshTime,
//         timestamp: currentDateTime,
//         dateLastRun: currentDateTime,
//         resultId: newCollectionId,
//       };

//       await addDoc(collection(db, "Live Report"), liveReportData);

//       navigate("/home", { state: { ...liveReportData } });
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <FormHeader activeStep={3} />
//       <div className="container">
//         <h3 className="title">Confirmation Page</h3>
//         <div className="form-group">
//           <label htmlFor="reportName">Report Name:</label>
//           <input
//             type="text"
//             id="reportName"
//             className="report-name-input"
//             value={reportName}
//             onChange={(e) => setReportName(e.target.value)}
//             readOnly={isEditing}
//           />
//         </div>
//         <div className="summary">
//           <h4>Selected Dimensions:</h4>
//           <ul>
//             {dimensions.map((dimension, index) => (
//               <li key={index}>{dimension}</li>
//             ))}
//           </ul>
//           <h4>Selected Metrics:</h4>
//           <ul>
//             {metric.map((metric, index) => (
//               <li key={index}>{metric}</li>
//             ))}
//           </ul>
//           <h4>Selected Refresh Time:</h4>
//           <p>{refreshTime}</p>
//         </div>
//         <div className="submit-button-container">
//           <button
//             className="submit-button"
//             onClick={handleSubmit}
//             disabled={isLoading}
//           >
//             {isLoading ? "Processing..." : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfoPage;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, getIdToken } from "firebase/auth";
import { db } from "../firebaseConfig";
import "../style/Section4.css";
import FormHeader from "./FormHeader/FormHeader";
import { v4 as uuidv4 } from "uuid";

const UserInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    dimensions = [],
    metric = [],
    refreshTime = "",
    isEditing = false,
    reportName: initialReportName = "",
    reportId: initialReportId = "",
    resultId: initialResultId = "",
  } = location.state || {};

  const [reportName, setReportName] = useState(initialReportName);
  const [isLoading, setIsLoading] = useState(false);
  const [projectSetupData, setProjectSetupData] = useState(null);

  useEffect(() => {
    // const fetchProjectSetup = async () => {
    //   try {
    //     const user = getAuth().currentUser;
    //     if (user) {
    //       const userDocRef = doc(db, "users", user.uid);
    //       const userDocSnap = await getDoc(userDocRef);
    //       if (userDocSnap.exists()) {
    //         const projectSetupDocRef = doc(db, "project_setups", user.uid);
    //         const projectSetupDocSnap = await getDoc(projectSetupDocRef);
    //         if (projectSetupDocSnap.exists()) {
    //           setProjectSetupData(projectSetupDocSnap.data());
    //         } else {
    //           console.log("Project setup document not found!");
    //         }
    //       } else {
    //         console.log("User document not found!");
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error fetching project setup:", error);
    //   }
    // };

    const fetchProjectSetup = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch("http://localhost:3001/project-setup", {
            headers: { Authorization: token },
          });

          if (response.ok) {
            const data = await response.json();
            setProjectSetupData(data);
          } else {
            console.log("Error fetching project setup:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error fetching project setup:", error);
      }
    };

    fetchProjectSetup();

    console.log(initialReportId);

    if (isEditing && initialReportId) {
      // const fetchData = async () => {
      //   try {
      //     const docRef = doc(db, "Live Report", initialReportId);
      //     const docSnap = await getDoc(docRef);
      //     if (docSnap.exists()) {
      //       const reportData = docSnap.data();
      //       setReportName(reportData.reportName);
      //     } else {
      //       console.log("No such document!");
      //     }
      //   } catch (error) {
      //     console.error("Error fetching data:", error);
      //   }
      // };
      const fetchData = async () => {
        try {
          const user = getAuth().currentUser;
          const token = await getIdToken(user);

          const response = await fetch(
            `http://localhost:3001/report/${initialReportId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              credentials: "include", // Ensure cookies are sent with the request (if applicable)
            }
          );

          if (response.ok) {
            const reportData = await response.json();
            setReportName(reportData.reportName);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [isEditing, initialReportId]);

  // const handleSubmit = async () => {
  //   if (!metric || metric.length === 0) return;
  //   if (reportName.trim() === "") {
  //     alert("Please enter a report name.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   const currentDateTime = new Date().toLocaleString("en-GB", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: false,
  //   });

  //   try {
  //     const res = await fetch("http://localhost:3001/query-bigquery", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         dimensions,
  //         metric,
  //         refreshTime,
  //         projectId: projectSetupData.projectId,
  //         datasetId: projectSetupData.datasetId,
  //         tableId: projectSetupData.tableId,
  //         serviceAccount: projectSetupData.serviceAccount,
  //       }),
  //     });

  //     const bigqueryData = await res.json();

  //     const user = getAuth().currentUser;
  //     const userDocRef = doc(db, "users", user.uid);
  //     const userDocSnap = await getDoc(userDocRef);
  //     const companyName = userDocSnap.data().companyName;

  //     if (isEditing) {
  //       console.log(initialResultId);

  //       if (initialResultId) {
  //         // Update existing result collection
  //         const resultCollection = collection(db, initialResultId);
  //         const resultCollectionSnap = await getDocs(resultCollection);
  //         const deletePromises = resultCollectionSnap.docs.map((rowDoc) =>
  //           deleteDoc(rowDoc.ref)
  //         );
  //         await Promise.all(deletePromises);

  //         for (const row of bigqueryData) {
  //           await addDoc(resultCollection, row);
  //         }

  //         // Update Live Report
  //         const liveReportDocRef = doc(db, "Live Report", initialReportId);
  //         await updateDoc(liveReportDocRef, {
  //           reportName,
  //           dimensions,
  //           metric,
  //           refreshTime,
  //           dateLastRun: currentDateTime,
  //           resultId: initialResultId,
  //         });

  //         navigate("/home", {
  //           state: {
  //             reportName,
  //             dimensions,
  //             metric,
  //             refreshTime,
  //             timestamp: currentDateTime,
  //             dateLastRun: currentDateTime,
  //             resultId: initialResultId,
  //           },
  //         });
  //       }
  //     } else {
  //       // Creating a new report
  //       const newCollectionId = `${companyName}-${uuidv4()}`;
  //       const resultsCollection = collection(db, newCollectionId);

  //       for (const row of bigqueryData) {
  //         await addDoc(resultsCollection, row);
  //       }

  //       const liveReportData = {
  //         reportName,
  //         dimensions,
  //         metric,
  //         refreshTime,
  //         timestamp: currentDateTime,
  //         dateLastRun: currentDateTime,
  //         resultId: newCollectionId,
  //       };

  //       await addDoc(collection(db, "Live Report"), liveReportData);

  //       navigate("/home", { state: liveReportData });
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!metric || metric.length === 0) return;
    if (reportName.trim() === "") {
      alert("Please enter a report name.");
      return;
    }

    setIsLoading(true);
    const currentDateTime = new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    try {
      const resBiq = await fetch("http://localhost:3001/query-bigquery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimensions,
          metric,
          refreshTime,
          projectId: projectSetupData.projectId,
          datasetId: projectSetupData.datasetId,
          tableId: projectSetupData.tableId,
          serviceAccount: projectSetupData.serviceAccount,
        }),
      });

      const bigqueryData = await resBiq.json();
      // console.log(bigqueryData);
      const user = getAuth().currentUser;
      const token = await getIdToken(user);

      const res = await fetch("http://localhost:3001/submit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          reportName,
          dimensions,
          metric,
          refreshTime,
          // projectId: projectSetupData.projectId,
          // datasetId: projectSetupData.datasetId,
          // tableId: projectSetupData.tableId,
          // serviceAccount: projectSetupData.serviceAccount,
          isEditing,
          initialResultId,
          initialReportId, // Send this to identify the document to update
          bigqueryData,
        }),
      });

      console.log(res);

      if (res.ok) {
        navigate("/home", {
          state: {
            reportName,
            dimensions,
            metric,
            refreshTime,
            timestamp: currentDateTime,
            dateLastRun: currentDateTime,
            resultId: initialResultId || uuidv4(),
          },
        });
      } else {
        console.error("Error submitting report:", res.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FormHeader activeStep={3} />
      <div className="container">
        <h3 className="title">{isEditing ? "Edit Report" : "Create Report"}</h3>
        <div className="form-group">
          <label htmlFor="reportName">Report Name:</label>
          <input
            type="text"
            id="reportName"
            className="report-name-input"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            readOnly={isEditing}
          />
        </div>
        <div className="summary">
          <h4>Selected Dimensions:</h4>
          <ul>
            {dimensions.length > 0 ? (
              dimensions.map((dimension, index) => (
                <li key={index}>{dimension}</li>
              ))
            ) : (
              <p>No dimensions selected.</p>
            )}
          </ul>
          <h4>Selected Metrics:</h4>
          <ul>
            {metric.length > 0 ? (
              metric.map((metricItem, index) => (
                <li key={index}>{metricItem}</li>
              ))
            ) : (
              <p>No metrics selected.</p>
            )}
          </ul>
          <h4>Selected Refresh Time:</h4>
          <p>{refreshTime || "No refresh time selected."}</p>
        </div>
        <div className="submit-button-container">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isEditing ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
