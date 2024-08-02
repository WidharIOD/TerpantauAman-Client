// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// const FinalPage = () => {
//   const location = useLocation();
//   const { section1Values, section2Value, section3Value } = location.state;

//   // State to store the data fetched from the server
//   const [queryResults, setQueryResults] = useState(null);

//   const metricAliases = {
//     totalUsers: "total_users",
//     revenue: "total_revenue",
//     eventCount: "total_events",
//     views: "total_views",
//   };

//   useEffect(() => {
//     if (!section2Value) return; // Don't fetch if metric is not selected

//     const fetchData = async () => {
//       try {
//         const response = await fetch("http://localhost:3001/query-bigquery", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             dimensions: section1Values, // Already an array
//             metric: section2Value,
//             refreshTime: section3Value,
//           }),
//         });

//         const data = await response.json();
//         setQueryResults(data); // Update state with the fetched data
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         // Handle errors appropriately
//       }
//     };

//     fetchData();
//   }, [section1Values, section2Value, section3Value]);

//   return (
//     <div>
//       <h1>Final Page</h1>

//       <h2>Query Results:</h2>

//       {/* Table for displaying results */}
//       {queryResults && queryResults.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               {/* Dynamically create table headers */}
//               {section1Values.map((dimension) => (
//                 <th key={dimension}>{dimension}</th>
//               ))}
//               <th>{metricAliases[section2Value]}</th>{" "}
//               {/* Use metric alias here */}
//             </tr>
//           </thead>
//           <tbody>
//             {queryResults.map((row, rowIndex) => (
//               <tr key={rowIndex}>
//                 {/* Dynamically render table cells */}
//                 {section1Values.map((dimension) => (
//                   <td key={`${rowIndex}-${dimension}`}>{row[dimension]}</td>
//                 ))}
//                 <td>{row[metricAliases[section2Value]]}</td>{" "}
//                 {/* Use metric alias here */}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>{queryResults ? "No data found." : "Loading data..."}</p>
//       )}

//       {/* ... (display other selections as before) ... */}
//     </div>
//   );
// };

// export default FinalPage;

// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import db from "../firebaseConfig";
// import "../style/ConfirmationPage.css";

// const FinalPage = () => {
//   const location = useLocation();
//   const { reportName } = location.state; // Get reportName from previous page

//   const [data, setData] = useState({
//     dimensions: [],
//     metric: null,
//     refreshTime: "",
//     queryResults: null,
//     timestamp: null,
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
//         const docRef = doc(db, "Live Report", reportName);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const firestoreData = docSnap.data();

//           const savedTime = new Date(firestoreData.timestamp);
//           const formattedSavedTime = savedTime.toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false,
//           });

//           const lastRunTime = new Date(firestoreData.dateLastRun || 0); // Default to 0 if not set
//           const formattedLastRunTime = lastRunTime.toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false,
//           });

//           const currentTime = new Date();
//           const refreshTimeInMinutes = parseInt(
//             firestoreData.refreshTime.split(" ")[0]
//           );

//           const timeDifference = (currentTime - savedTime) / (1000 * 60);
//           const timeSinceLastRun = (currentTime - lastRunTime) / (1000 * 60);

//           if (
//             timeDifference <= refreshTimeInMinutes &&
//             timeSinceLastRun <= refreshTimeInMinutes
//           ) {
//             // Data is still fresh, use it directly from Firestore
//             setData({
//               ...firestoreData, // Use all data from Firestore
//             });
//           } else {
//             // Data is stale or hasn't been run recently, fetch from BigQuery
//             const dimensions = firestoreData.dimensions || [];
//             const metric = firestoreData.metric || null;
//             const refreshTime = firestoreData.refreshTime || "";

//             const bqResponse = await fetch(
//               "http://localhost:3001/query-bigquery",
//               {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                   dimensions,
//                   metric,
//                   refreshTime,
//                 }),
//               }
//             );

//             const bigqueryData = await bqResponse.json();

//             // Update Firestore with new results, timestamp, and dateLastRun
//             await setDoc(docRef, {
//               ...firestoreData,
//               results: bigqueryData,
//               // timestamp: formattedSavedTime, // Already in the desired format
//               dateLastRun: formattedLastRunTime,
//             });

//             setData({
//               dimensions,
//               metric,
//               refreshTime,
//               queryResults: bigqueryData,
//               // timestamp: formattedSavedTime,
//               dateLastRun: formattedLastRunTime,
//             });
//           }
//         } else {
//           console.log("No such document!");
//           // Handle the case where the document doesn't exist
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [reportName]);

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "../firebaseConfig";
import "../style/ConfirmationPage.css";

const FinalPage = () => {
  const location = useLocation();
  const { reportName } = location.state;

  const [data, setData] = useState({
    dimensions: [],
    metric: null,
    refreshTime: "",
    queryResults: null,
    timestamp: null,
    dateLastRun: null,
  });

  const metricAliases = {
    totalUsers: "total_users",
    revenue: "total_revenue",
    eventCount: "total_events",
    views: "total_views",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the document from Firestore to get dimensions and metric
        const docRef = doc(db, "Live Report", reportName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const firestoreData = docSnap.data();

          const dimensions = firestoreData.dimensions || [];
          const metric = firestoreData.metric || null;
          const refreshTime = firestoreData.refreshTime || "";

          // Always fetch from BigQuery
          const bqResponse = await fetch(
            "http://localhost:3001/query-bigquery",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dimensions,
                metric,
                refreshTime,
              }),
            }
          );

          const bigqueryData = await bqResponse.json();

          // Get the current date and time in the desired format
          const currentDateTime = new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });

          // Update Firestore with the new dateLastRun
          await setDoc(
            docRef,
            {
              ...firestoreData,
              dateLastRun: currentDateTime,
            },
            { merge: true }
          ); // Use merge to only update the dateLastRun field

          setData({
            dimensions,
            metric,
            refreshTime,
            queryResults: bigqueryData,
            timestamp: firestoreData.timestamp, // Keep the original timestamp
            dateLastRun: currentDateTime,
          });
        } else {
          console.log("No such document!");
          // Handle the case where the document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [reportName]);

  return (
    <div>
      <h1>Final Page</h1>
      <h2>{reportName}'s Report</h2>{" "}
      {/* Display the reportName from location.state */}
      <h2>Query Results:</h2>
      {/* Table for displaying results */}
      {data.queryResults && data.queryResults.length > 0 ? (
        <table className="report-table">
          <thead>
            <tr>
              {/* Dynamically create table headers */}
              {data.dimensions.map((dimension) => (
                <th key={dimension}>{dimension}</th>
              ))}
              <th>{metricAliases[data.metric]}</th>
            </tr>
          </thead>
          <tbody>
            {data.queryResults.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* Dynamically render table cells */}
                {data.dimensions.map((dimension) => (
                  <td key={`${rowIndex}-${dimension}`}>{row[dimension]}</td>
                ))}
                <td>{row[metricAliases[data.metric]]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{data.queryResults ? "No data found." : "Loading data..."}</p>
      )}
    </div>
  );
};

export default FinalPage;
