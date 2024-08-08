// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import db from "../firebaseConfig";
// import "../style/ConfirmationPage.css";

// const FinalPage = () => {
//   const location = useLocation();
//   const { reportId, resultId, reportName } = location.state;

//   const [data, setData] = useState({
//     dimensions: [],
//     metric: null,
//     refreshTime: "",
//     queryResults: null,
//     timestamp: null,
//     dateLastRun: null,
//   });

//   const metricAliases = {
//     totalUsers: "total_users",
//     revenue: "total_revenue",
//     eventCount: "total_events",
//     views: "total_views",
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch the "Live Report" document to get the latest dateLastRun
//         const liveReportDocRef = doc(db, "Live Report", reportId);
//         const liveReportDocSnap = await getDoc(liveReportDocRef);

//         if (liveReportDocSnap.exists()) {
//           const liveReportData = liveReportDocSnap.data();
//           const formattedLastRunTime = new Date(
//             liveReportData.dateLastRun
//           ).toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false,
//           });

//           // Fetch data from "Report Result" collection using resultId
//           const resultDocRef = doc(db, "Report Result", resultId);
//           const resultDocSnap = await getDoc(resultDocRef);

//           if (resultDocSnap.exists()) {
//             const resultData = resultDocSnap.data();

//             const firstResult = resultData.results[0];
//             const dimensions = Object.keys(firstResult).filter(
//               (key) => key !== metricAliases[resultData.metric]
//             );
//             const metric = resultData.metric || null;
//             const refreshTime = resultData.refreshTime || "";

//             setData({
//               dimensions,
//               metric,
//               refreshTime,
//               queryResults: resultData.results || null,
//               timestamp: resultData.timestamp,
//               dateLastRun: formattedLastRunTime, // Use the latest dateLastRun from "Live Report"
//               reportName: reportName,
//             });
//           } else {
//             console.log("No results found for this report!");
//           }
//         } else {
//           console.log("No such document!");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [reportId, resultId, reportName]); // Re-fetch if reportName or resultId changes

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       // Fetch the document from Firestore to get dimensions and metric
//   //       const docRef = doc(db, "Live Report", reportName);
//   //       const docSnap = await getDoc(docRef);

//   //       if (docSnap.exists()) {
//   //         const firestoreData = docSnap.data();

//   //         const dimensions = firestoreData.dimensions || [];
//   //         const metric = firestoreData.metric || null;
//   //         const refreshTime = firestoreData.refreshTime || "";

//   //         // Always fetch from BigQuery
//   //         const bqResponse = await fetch(
//   //           "http://localhost:3001/query-bigquery",
//   //           {
//   //             method: "POST",
//   //             headers: { "Content-Type": "application/json" },
//   //             body: JSON.stringify({
//   //               dimensions,
//   //               metric,
//   //               refreshTime,
//   //             }),
//   //           }
//   //         );

//   //         const bigqueryData = await bqResponse.json();

//   //         // Get the current date and time in the desired format
//   //         const currentDateTime = new Date().toLocaleString("en-GB", {
//   //           day: "2-digit",
//   //           month: "2-digit",
//   //           year: "numeric",
//   //           hour: "2-digit",
//   //           minute: "2-digit",
//   //           second: "2-digit",
//   //           hour12: false,
//   //         });

//   //         // Update Firestore with the new dateLastRun
//   //         await setDoc(
//   //           docRef,
//   //           {
//   //             ...firestoreData,
//   //             dateLastRun: currentDateTime,
//   //           },
//   //           { merge: true }
//   //         ); // Use merge to only update the dateLastRun field

//   //         setData({
//   //           dimensions,
//   //           metric,
//   //           refreshTime,
//   //           queryResults: bigqueryData,
//   //           timestamp: firestoreData.timestamp, // Keep the original timestamp
//   //           dateLastRun: currentDateTime,
//   //         });
//   //       } else {
//   //         console.log("No such document!");
//   //         // Handle the case where the document doesn't exist
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching data:", error);
//   //     }
//   //   };

//   //   fetchData();
//   // }, [reportName]);

//   return (
//     <div>
//       <h1>Final Page</h1>
//       <h2>{data.reportName}'s Report</h2>
//       <h2>Query Results:</h2>

//       {data.queryResults && data.queryResults.length > 0 ? (
//         <div>
//           <p>Last Updated: {data.dateLastRun}</p>
//           <table className="report-table">
//             <thead>
//               <tr>
//                 {/* Sort the keys to ensure dimensions come first, then metric */}
//                 {Object.keys(data.queryResults[0])
//                   .sort((a, b) => {
//                     if (a === metricAliases[data.metric]) return 1; // Metric comes last
//                     if (b === metricAliases[data.metric]) return -1;
//                     return a.localeCompare(b); // Sort dimensions alphabetically
//                   })
//                   .map((key) => (
//                     <th key={key}>{key}</th>
//                   ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data.queryResults.map((row, rowIndex) => (
//                 <tr key={rowIndex}>
//                   {/* Render cells in the same order as the headers */}
//                   {Object.keys(data.queryResults[0])
//                     .sort((a, b) => {
//                       if (a === metricAliases[data.metric]) return 1;
//                       if (b === metricAliases[data.metric]) return -1;
//                       return a.localeCompare(b);
//                     })
//                     .map((key) => (
//                       <td key={`${rowIndex}-${key}`}>{row[key]}</td>
//                     ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p>{data.queryResults ? "No data found." : "Loading data..."}</p>
//       )}
//     </div>
//   );
// };

// export default FinalPage;

// import React, { useEffect, useState, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
// import { db } from "../firebaseConfig";
// import { getAuth } from "firebase/auth";

// // import "../style/ConfirmationPage.css";
// import "../style/RealtimeDashboard.css";

// import TableRealtime from "./TableRealtime/TableRealtime";
// import SearchBar from "./SearchBar/SearchBar";
// import DataColumns from "../data/dataColums";

// const FinalPage = () => {
//   const location = useLocation();
//   const { reportId, resultId, reportName } = location.state;

//   const [data, setData] = useState({
//     dimensions: [],
//     metric: null,
//     refreshTime: "",
//     queryResults: null,
//     timestamp: null,
//     dateLastRun: null,
//   });

//   const [filteredReviews, setFilteredReviews] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   const metricAliases = {
//     totalUsers: "total_users",
//     revenue: "total_revenue",
//     eventCount: "total_events",
//     views: "total_views",
//   };
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

//     // Fetch initial data and set up real-time listener
//     const fetchDataAndListen = async () => {
//       try {
//         // Fetch the "Live Report" document to get the latest dateLastRun
//         const liveReportDocRef = doc(db, "Live Report", reportId);
//         const liveReportDocSnap = await getDoc(liveReportDocRef);

//         if (liveReportDocSnap.exists()) {
//           const liveReportData = liveReportDocSnap.data();
//           const formattedLastRunTime = new Date(
//             liveReportData.dateLastRun
//           ).toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false,
//           });

//           // Fetch initial data from "Report Result" collection using resultId
//           const resultDocRef = doc(db, "Report Result", resultId);
//           const resultDocSnap = await getDoc(resultDocRef);

//           if (resultDocSnap.exists()) {
//             const resultData = resultDocSnap.data();
//             handleDataUpdate(resultData, formattedLastRunTime, reportName); // Handle initial data
//           } else {
//             console.log("No results found for this report!");
//           }

//           // Set up real-time listener on the "Report Result" document
//           const unsubscribe = onSnapshot(resultDocRef, (doc) => {
//             if (doc.exists()) {
//               const resultData = doc.data();
//               handleDataUpdate(resultData, formattedLastRunTime, reportName); // Handle updates
//             } else {
//               console.log("Report Result document deleted!");
//               // Handle the case where the document is deleted
//             }
//           });

//           // Clean up the listener when the component unmounts
//           return () => unsubscribe();
//         } else {
//           console.log("No such document!");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchDataAndListen();
//   }, [reportId, resultId]);

//   const handleDataUpdate = (resultData, formattedLastRunTime, reportName) => {
//     const firstResult = resultData.results[0];
//     const dimensions = Object.keys(firstResult).filter(
//       (key) => key !== metricAliases[resultData.metric]
//     );
//     const metric = resultData.metric || null;
//     const refreshTime = resultData.refreshTime || "";

//     setData({
//       dimensions,
//       metric,
//       refreshTime,
//       queryResults: resultData.results || null,
//       timestamp: resultData.timestamp,
//       dateLastRun: formattedLastRunTime,
//       reportName,
//     });

//     setFilteredReviews(resultData.results || []);
//   };

//   // Filter and map columns based on selectedColumnIds
//   const selectedColumnIds = data.dimensions.concat([data.metric]);
//   console.log("Selected Column IDs:", selectedColumnIds); // Log for debugging

//   const columns = DataColumns.filter((col) =>
//     selectedColumnIds.includes(col.id)
//   ).map((col) => ({
//     ...col,
//     label: (
//       <span>
//         <i className={col.icon}></i> {col.label}
//       </span>
//     ),
//   }));

//   // console.log("Columns:", columns); // Log for debugging

//   const filterReviews = useCallback(() => {
//     let filteredData = data.queryResults || [];

//     if (searchQuery) {
//       const regex = new RegExp(searchQuery, "i");
//       filteredData = filteredData.filter((review) =>
//         Object.values(review).some((value) => regex.test(value))
//       );
//     }

//     setFilteredReviews(filteredData);
//   }, [searchQuery, data.queryResults]);

//   useEffect(() => {
//     filterReviews();
//   }, [filterReviews, data.queryResults]);

//   const handleSearchSubmit = (query) => {
//     setSearchQuery(query);
//   };

//   // Function to handle the "Re-query" button click
//   const handleRequery = async () => {
//     try {
//       // Fetch the latest report configuration from Firestore
//       const liveReportDocRef = doc(db, "Live Report", reportId);
//       const liveReportDocSnap = await getDoc(liveReportDocRef);

//       if (liveReportDocSnap.exists()) {
//         const liveReportData = liveReportDocSnap.data();

//         // Extract the parameters from Firestore
//         const dimensions = liveReportData.dimensions || [];
//         const metric = liveReportData.metric || null;
//         const refreshTime = liveReportData.refreshTime || "";

//         // Fetch fresh data from BigQuery

//         const bqResponse = await fetch("http://localhost:3001/query-bigquery", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             dimensions,
//             metric,
//             refreshTime,
//             projectId: projectSetupData.projectId, // Include from Firestore
//             datasetId: projectSetupData.datasetId,
//             tableId: projectSetupData.tableId,
//             serviceAccount: projectSetupData.serviceAccount,
//           }),
//         });

//         const bigqueryData = await bqResponse.json();

//         console.log(bigqueryData);

//         // Get the current date and time
//         const currentDateTime = new Date().toLocaleString("en-GB", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//           hour12: false,
//         });

//         // Update "Report Result" with new results and timestamp
//         const resultDocRef = doc(db, "Report Result", resultId);
//         await setDoc(
//           resultDocRef,
//           {
//             results: bigqueryData,
//             timestamp: currentDateTime,
//             dateLastRun: currentDateTime,
//           },
//           { merge: true }
//         );

//         // Update "Live Report" with new dateLastRun
//         const liveReportDocRef = doc(db, "Live Report", reportId);
//         await setDoc(
//           liveReportDocRef,
//           { dateLastRun: currentDateTime },
//           { merge: true }
//         );

//         // Update the component's state with the new data
//         setData({
//           ...data,
//           queryResults: bigqueryData,
//           dateLastRun: currentDateTime,
//         });
//       } else {
//         console.log("No such document!");
//       }
//     } catch (error) {
//       console.error("Error re-querying data:", error);
//       // Handle error appropriately
//     }
//   };

//   return (
//     <div className="enhancer-container">
//       <h1>{data.reportName}'s Report</h1>
//       <div style={{ position: "relative" }}>
//         <div className="date-container" style={{ position: "relative" }}>
//           <SearchBar onSearchSubmit={handleSearchSubmit} />

//           {/* Add the "Re-query" button */}
//           {/* <button className="filter-button">
//             {" "}
//             <i className="fa fa-filter" aria-hidden="true"></i> Filter
//           </button> */}
//           {/* <button className="edit-button"> Edit Report</button> */}
//         </div>
//         <div className="table-container" style={{ position: "relative" }}>
//           <TableRealtime rows={filteredReviews} columns={columns} />
//         </div>
//         <p>Last Updated: {data.dateLastRun}</p>
//         <button className="requery-button" onClick={handleRequery}>
//           Re-query
//         </button>{" "}
//       </div>
//     </div>
//   );
// };

// export default FinalPage;

import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, getIdToken } from "firebase/auth";

// import "../style/ConfirmationPage.css";
import "../style/RealtimeDashboard.css";

import TableRealtime from "./TableRealtime/TableRealtime";
import SearchBar from "./SearchBar/SearchBar";
import DataColumns from "../data/dataColums";

const FinalPage = () => {
  const location = useLocation();
  const { reportId, resultId, reportName } = location.state;

  const [data, setData] = useState({
    dimensions: [],
    metric: null,
    refreshTime: "",
    queryResults: [],
    timestamp: null,
    dateLastRun: null,
  });

  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const metricAliases = {
    totalUsers: "total_users",
    revenue: "total_revenue",
    eventCount: "total_events",
    views: "total_views",
  };

  const [projectSetupData, setProjectSetupData] = useState(null);

  // useEffect(() => {
  //   const fetchProjectSetup = async () => {
  //     try {
  //       const user = getAuth().currentUser;
  //       if (user) {
  //         const userDocRef = doc(db, "users", user.uid);
  //         const userDocSnap = await getDoc(userDocRef);
  //         if (userDocSnap.exists()) {
  //           const companyName = userDocSnap.data().companyName;
  //           const projectSetupDocRef = doc(db, "project_setups", user.uid);
  //           const projectSetupDocSnap = await getDoc(projectSetupDocRef);
  //           if (projectSetupDocSnap.exists()) {
  //             setProjectSetupData(projectSetupDocSnap.data());
  //           } else {
  //             console.log("Project setup document not found!");
  //           }
  //         } else {
  //           console.log("User document not found!");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching project setup:", error);
  //     }
  //   };

  //   fetchProjectSetup();

  //   const fetchDataAndListen = async () => {
  //     try {
  //       const liveReportDocRef = doc(db, "Live Report", reportId);

  //       // Listen to real-time updates on the "Live Report" document
  //       const unsubscribeLiveReport = onSnapshot(
  //         liveReportDocRef,
  //         (liveReportDocSnap) => {
  //           if (liveReportDocSnap.exists()) {
  //             const liveReportData = liveReportDocSnap.data();
  //             const formattedLastRunTime = new Date(
  //               liveReportData.dateLastRun
  //             ).toLocaleString("en-GB", {
  //               day: "2-digit",
  //               month: "2-digit",
  //               year: "numeric",
  //               hour: "2-digit",
  //               minute: "2-digit",
  //               second: "2-digit",
  //               hour12: false,
  //             });

  //             const resultCollectionRef = collection(db, resultId);
  //             const unsubscribeResults = onSnapshot(
  //               resultCollectionRef,
  //               (querySnapshot) => {
  //                 const resultData = querySnapshot.docs.map((doc) =>
  //                   doc.data()
  //                 );
  //                 handleDataUpdate(
  //                   resultData,
  //                   formattedLastRunTime,
  //                   reportName
  //                 );
  //               }
  //             );

  //             return () => {
  //               unsubscribeResults();
  //               unsubscribeLiveReport();
  //             };
  //           } else {
  //             console.log("No such document!");
  //           }
  //         }
  //       );
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchDataAndListen();
  // }, [reportId, resultId]);

  useEffect(() => {
    const fetchProjectSetup = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const token = await getIdToken(user);

          const response = await fetch("http://localhost:3001/project-setup", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          });

          const projectSetup = await response.json();
          setProjectSetupData(projectSetup);
        }
      } catch (error) {
        console.error("Error fetching project setup:", error);
      }
    };

    const fetchDataAndListen = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const token = await getIdToken(user);

          const response = await fetch(
            `http://localhost:3001/live-report/${reportId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          );

          const reportData = await response.json();
          handleDataUpdate(
            reportData.queryResults,
            reportData.dateLastRun,
            reportName
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProjectSetup();
    fetchDataAndListen();
  }, [reportId, reportName]);

  const handleDataUpdate = (resultData, formattedLastRunTime, reportName) => {
    if (resultData.length > 0) {
      const firstResult = resultData[0];
      const dimensions = Object.keys(firstResult).filter(
        (key) => key !== metricAliases[resultData.metric]
      );
      const metric = resultData.metric || null;
      const refreshTime = resultData.refreshTime || "";

      setData({
        dimensions,
        metric,
        refreshTime,
        queryResults: resultData,
        timestamp: resultData.timestamp,
        dateLastRun: formattedLastRunTime,
        reportName,
      });

      setFilteredReviews(resultData);
    }
  };

  const selectedColumnIds = data.dimensions.concat([data.metric]);
  const columns = DataColumns.filter((col) =>
    selectedColumnIds.includes(col.id)
  ).map((col) => ({
    ...col,
    label: (
      <span>
        <i className={col.icon}></i> {col.label}
      </span>
    ),
  }));

  const filterReviews = useCallback(() => {
    let filteredData = data.queryResults || [];

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      filteredData = filteredData.filter((review) =>
        Object.values(review).some((value) => regex.test(value))
      );
    }

    setFilteredReviews(filteredData);
  }, [searchQuery, data.queryResults]);

  useEffect(() => {
    filterReviews();
  }, [filterReviews, data.queryResults]);

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
  };

  const handleRequery = async () => {
    try {
      const liveReportDocRef = doc(db, "Live Report", reportId);
      const liveReportDocSnap = await getDoc(liveReportDocRef);

      if (liveReportDocSnap.exists()) {
        const liveReportData = liveReportDocSnap.data();

        const dimensions = liveReportData.dimensions || [];
        const metric = liveReportData.metric || null;
        const refreshTime = liveReportData.refreshTime || "";

        const bqResponse = await fetch("http://localhost:3001/query-bigquery", {
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

        const bigqueryData = await bqResponse.json();

        const currentDateTime = new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        const resultCollectionRef = collection(db, resultId);
        const batch = db.batch();

        bigqueryData.forEach((result) => {
          const resultDocRef = doc(resultCollectionRef, result.id);
          batch.set(resultDocRef, result);
        });

        await batch.commit();

        await setDoc(
          liveReportDocRef,
          { dateLastRun: currentDateTime },
          { merge: true }
        );

        setData({
          ...data,
          queryResults: bigqueryData,
          dateLastRun: currentDateTime,
        });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error re-querying data:", error);
    }
  };

  return (
    <div className="enhancer-container">
      <h1>{data.reportName}'s Report</h1>
      <div style={{ position: "relative" }}>
        <div className="date-container" style={{ position: "relative" }}>
          <SearchBar onSearchSubmit={handleSearchSubmit} />
        </div>
        <div className="table-container" style={{ position: "relative" }}>
          <TableRealtime rows={filteredReviews} columns={columns} />
        </div>
        <p>Last Updated: {data.dateLastRun}</p>
        <button className="requery-button" onClick={handleRequery}>
          Re-query
        </button>
      </div>
    </div>
  );
};

export default FinalPage;
