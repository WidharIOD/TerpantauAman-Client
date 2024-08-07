// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { addDoc, doc, setDoc, collection, getDoc } from "firebase/firestore";
// import db from "../firebaseConfig";

// const UserInfoPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const fileData = location.state;

//   // Retrieve values from previous steps
//   // const dimensions = location.state?.dimensions || [];
//   // const metric = location.state?.metric || null;
//   // const refreshTime = location.state?.refreshTime || "";
//   //   const [dimensions, setDimensions] = useState([]);
//   //   const [metric, setMetric] = useState(null);
//   //   const [refreshTime, setRefreshTime] = useState("");

//   const {
//     dimensions,
//     metric,
//     refreshTime,
//     isEditing,
//     reportName: initialReportName,
//     reportId: initialReportId, // Get the reportId if editing
//   } = location.state || {};

//   const [reportName, setUserName] = useState(initialReportName || "");
//   const [isLoading, setIsLoading] = useState(false); // Loading state

//   const [queryResults, setQueryResults] = useState(null);

//   useEffect(() => {
//     if (isEditing && initialReportName && initialReportId) {
//       const fetchData = async () => {
//         try {
//           const docRef = doc(db, "Live Report", initialReportId);
//           const docSnap = await getDoc(docRef);
//           console.log(initialReportName);

//           if (docSnap.exists()) {
//             const reportData = docSnap.data();
//             setUserName(reportData.reportName);
//           } else {
//             console.log("No such document!");
//           }
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };

//       fetchData();
//     }
//   }, [isEditing, initialReportName, initialReportId]);

//   const handleSubmit = async () => {
//     // setDimensions(fileData.dimensions || []);
//     // setMetric(fileData.metric || null);
//     // setRefreshTime(fileData.refreshTime || "");
//     // setUserName(fileData.reportName || "");

//     if (!metric) return; // Don't fetch if metric is missing
//     if (reportName.trim() === "") {
//       // Basic validation (check for empty name)
//       alert("Please enter your name.");
//       return;
//     }
//     setIsLoading(true); // Set loading state
//     const currentDateTime = new Date().toLocaleString("en-GB", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false, // Use 24-hour format
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
//         }),
//       });
//       const bigqueryData = await res.json();

//       // Data to save in "report_results" (including query results)
//       const resultsData = {
//         results: bigqueryData, // Only store query results here
//         timestamp: currentDateTime,
//         dateLastRun: currentDateTime,
//       };

//       let resultDocRef; // Declare resultDocRef outside the if-else block

//       if (isEditing) {
//         // Update existing "report_results" document
//         const docRef = doc(db, "Live Report", initialReportId);
//         const docSnap = await getDoc(docRef);
//         const reportData = docSnap.data();

//         resultDocRef = doc(db, "Report Result", reportData.resultId);
//         await setDoc(resultDocRef, resultsData, { merge: true });
//       } else {
//         // Create a new document in "report_results"
//         const resultsCollection = collection(db, "Report Result");
//         resultDocRef = await addDoc(resultsCollection, resultsData);
//       }

//       // Data to save in "Live Report"
//       const liveReportData = {
//         reportName,
//         dimensions,
//         metric,
//         refreshTime,
//         timestamp: currentDateTime,
//         dateLastRun: currentDateTime,
//         resultId: resultDocRef.id,
//       };

//       if (isEditing) {
//         // Update existing "Live Report" document

//         const liveReportDocRef = doc(db, "Live Report", initialReportId);
//         await setDoc(liveReportDocRef, liveReportData, { merge: true });
//       } else {
//         // Create new document in "Live Report"
//         const liveReportsCollection = collection(db, "Live Report"); // Get collection reference
//         await addDoc(liveReportsCollection, liveReportData); // Use addDoc
//       }

//       navigate("/", { state: resultsData });
//     } catch (error) {
//       console.error("Error:", error);
//       // Handle errors appropriately (e.g., display error messages to the user)
//     } finally {
//       setIsLoading(false); // Reset loading state
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
//         onChange={(e) => setUserName(e.target.value)}
//         readOnly={isEditing} // Make it read-only in edit mode
//       />
//       <button onClick={handleSubmit} disabled={isLoading}>
//         {isLoading ? "Processing..." : "Proceed to Results"}
//       </button>
//     </div>
//   );
// };

// export default UserInfoPage;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { addDoc, doc, setDoc, collection, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";

const UserInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileData = location.state || {};

  const {
    dimensions,
    metric,
    refreshTime,
    isEditing,
    reportName: initialReportName,
    id: initialReportId,
    resultId: initialResultId,
  } = fileData;

  console.log(fileData);

  const [reportName, setReportName] = useState(initialReportName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [projectSetupData, setProjectSetupData] = useState(null); // To store fetched project setup data

  useEffect(() => {
    // Fetch project setup details from Firestore
    const fetchProjectSetup = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const companyName = userDocSnap.data().companyName;
            const projectSetupDocRef = doc(db, "project_setups", user.uid);
            const projectSetupDocSnap = await getDoc(projectSetupDocRef);
            if (projectSetupDocSnap.exists()) {
              setProjectSetupData(projectSetupDocSnap.data());
            } else {
              console.log("Project setup document not found!");
              // Handle this case appropriately (e.g., redirect to ProjectSetupPage)
            }
          } else {
            console.log("User document not found!");
          }
        }
      } catch (error) {
        console.error("Error fetching project setup:", error);
      }
    };

    fetchProjectSetup();
    if (isEditing && initialReportId) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "Live Report", initialReportId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const reportData = docSnap.data();
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

  const handleSubmit = async () => {
    if (!metric) return;
    if (reportName.trim() === "") {
      alert("Please enter your name.");
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
      const res = await fetch("http://localhost:3001/query-bigquery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimensions,
          metric,
          refreshTime,
          projectId: projectSetupData.projectId, // Include from Firestore
          datasetId: projectSetupData.datasetId,
          tableId: projectSetupData.tableId,
          serviceAccount: projectSetupData.serviceAccount,
        }),
      });

      const bigqueryData = await res.json();

      const resultsData = {
        results: bigqueryData,
        timestamp: currentDateTime,
        dateLastRun: currentDateTime,
      };
      let resultDocRef;

      if (isEditing) {
        // Update existing "report_results" document
        resultDocRef = doc(db, "Report Result", fileData.resultId);
        await setDoc(resultDocRef, resultsData, { merge: true });

        // Update existing "Live Report" document
        const liveReportDocRef = doc(db, "Live Report", initialReportId);
        await setDoc(
          liveReportDocRef,
          {
            reportName,
            dimensions,
            metric,
            refreshTime,
            timestamp: currentDateTime,
            dateLastRun: currentDateTime,
            // resultId remains the same since we're updating the existing report
          },
          { merge: true }
        );
      } else {
        // Create new Report Result document
        const resultsCollection = collection(db, "Report Result");
        const resultDocRef = await addDoc(resultsCollection, resultsData);

        // Create new Live Report document
        const liveReportData = {
          reportName,
          dimensions,
          metric,
          refreshTime,
          timestamp: currentDateTime,
          dateLastRun: currentDateTime,
          resultId: resultDocRef.id,
        };
        const liveReportsCollection = collection(db, "Live Report");
        await addDoc(liveReportsCollection, liveReportData);
      }

      navigate("/home", { state: resultsData });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>User Information</h1>
      <label htmlFor="reportName">Enter your name:</label>
      <input
        type="text"
        id="reportName"
        value={reportName}
        onChange={(e) => setReportName(e.target.value)}
        readOnly={isEditing}
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Processing..." : "Proceed to Results"}
      </button>
    </div>
  );
};

export default UserInfoPage;
