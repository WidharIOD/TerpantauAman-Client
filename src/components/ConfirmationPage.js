// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const ConfirmationPage = () => {
//   const location = useLocation();
//   const { dimensions, metric, refreshTime, reportName } = location.state;
//   const navigate = useNavigate();

//   const handleSubmit = () => {
//     // Pass all data to the FinalPage
//     navigate("/final", { state: location.state });
//   };

//   //   const handleSubmit = async () => {
//   //     try {
//   //       // Send data to backend to be saved to GCS
//   //       const response = await fetch("http://localhost:3001/save-to-gcs", {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify(location.state),
//   //       });

//   //       const data = await response.json();
//   //       console.log(data); // Log the response from the server (optional)

//   //       // After saving, you can navigate to the FinalPage or elsewhere
//   //       navigate("/final", { state: location.state });
//   //     } catch (error) {
//   //       console.error("Error saving data:", error);
//   //       // Handle the error (e.g., display an error message to the user)
//   //     }
//   //   };

//   return (
//     <div>
//       <h1>Confirm Your Selections</h1>
//       <h2>Dimensions:</h2>
//       <ul>
//         {dimensions.map((value, index) => (
//           <li key={index}>{value}</li>
//         ))}
//       </ul>
//       <p>Metric: {metric}</p>
//       <p>Refresh Time: {refreshTime}</p>
//       <p>User Name: {reportName}</p>
//       <button onClick={handleSubmit}>Proceed to Results</button>
//     </div>
//   );
// };

// export default ConfirmationPage;

// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const ConfirmationPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [fileList, setFileList] = useState([]); // State to store the file list

//   useEffect(() => {
//     // Fetch the file list when the component mounts
//     const fetchFileList = async () => {
//       try {
//         const response = await fetch("http://localhost:3001/list-files");
//         const data = await response.json();
//         setFileList(data.files); // Assuming the backend returns an array named 'files'
//       } catch (error) {
//         console.error("Error fetching file list:", error);
//         // Handle error (e.g., display an error message)
//       }
//     };

//     fetchFileList();
//   }, []); // Empty dependency array ensures this runs only once
//   const handleFileClick = async (fileName) => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/get-file/${fileName}`
//       );
//       const fileData = await response.json();
//       navigate("/final", { state: fileData }); // Pass the file data to FinalPage
//     } catch (error) {
//       console.error("Error fetching file data:", error);
//       // Handle error
//     }
//   };

//   const handleSubmit = () => {
//     navigate("/final", { state: location.state });
//   };

//   return (
//     <div>
//       <h1>List of Files in Cloud Storage</h1>

//       {fileList.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               <th>Filename</th>
//               <th>Date Created</th>
//             </tr>
//           </thead>
//           <tbody>
//             {fileList.map((file, index) => (
//               <tr
//                 key={index}
//                 onClick={() => handleFileClick(file.name)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <td>{file.name.replace(".json", "")}</td>{" "}
//                 {/* Remove .json extension */}
//                 <td>{new Date(file.timeCreated).toLocaleString()}</td>{" "}
//                 {/* Format timestamp */}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No files found.</p>
//       )}

//       {/* ... (rest of your confirmation page content) ... */}
//     </div>
//   );
// };
// export default ConfirmationPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth"; // Import signOut
import { db, auth } from "../firebaseConfig";
import { EditOutlined } from "@ant-design/icons";
import "../style/ConfirmationPage.css";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [companyName, setCompanyName] = useState(null); // State to store company name

  const fetchCompanyName = async () => {
    const user = getAuth().currentUser;
    // console.log(user.uid);
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCompanyName(userDocSnap.data().companyName);
        } else {
          console.log("User document not found!");
        }
      } catch (error) {
        console.error("Error fetching company name:", error);
      }
    }
  };

  useEffect(() => {
    fetchReports();
    fetchCompanyName(); // Fetch company name when component mounts

    // // Set up an interval to refresh reports every 5 minutes (adjust as needed)
    // const intervalId = setInterval(async () => {
    //   try {
    //     const response = await fetch(
    //       "http://localhost:3001/refresh-all-reports"
    //     );
    //     const data = await response.json();
    //     console.log(data.message);

    //     // Re-fetch the report list to show updated 'dateLastRun'
    //     fetchReports();
    //   } catch (error) {
    //     console.error("Error refreshing reports:", error);
    //   }
    // }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // // Clean up the interval when the component unmounts
    // return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Navigate to LoginPage after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Live Report"));
      const reports = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          reportName: data.reportName,
          timestamp: data.timestamp,
          dateLastRun: data.dateLastRun,
          resultId: data.resultId, // Include the resultId from "Live Report"
          refreshTime: data.refreshTime,
        });
      });
      setReportList(reports);
      // Check if any reports need refreshing
      // await refreshReportsIfNeeded(reports);
    } catch (error) {
      console.error("Error fetching reports from Firestore:", error);
    }
  };

  // Function to refresh reports if needed
  const refreshReportsIfNeeded = async (reports) => {
    const currentTime = new Date();

    // Set up an interval to check for refreshes every minute (adjust as needed)
    const intervalId = setInterval(async () => {
      const refreshPromises = reports.map(async (report) => {
        if (report.refreshTime && typeof report.refreshTime === "string") {
          const refreshTimeInMinutes = parseInt(
            report.refreshTime.split(" ")[0]
          );
          console.log(refreshTimeInMinutes);
          const timeDifference =
            (currentTime - new Date(report.dateLastRun)) / (1000 * 60);

          if (timeDifference > refreshTimeInMinutes) {
            try {
              // Fetch data from BigQuery
              const bqResponse = await fetch(
                "http://localhost:3001/query-bigquery",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    dimensions: report.dimensions,
                    metric: report.metric,
                    refreshTime: report.refreshTime,
                  }),
                }
              );

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

              // Update "Report Result" with new results and timestamp
              const resultDocRef = doc(db, "Report Result", report.resultId);
              await setDoc(
                resultDocRef,
                {
                  results: bigqueryData,
                  timestamp: currentDateTime,
                  dateLastRun: currentDateTime,
                },
                { merge: true }
              );

              // Update "Live Report" with new dateLastRun
              const liveReportDocRef = doc(db, "Live Report", report.id);
              await setDoc(
                liveReportDocRef,
                { dateLastRun: currentDateTime },
                { merge: true }
              );
            } catch (error) {
              console.error("Error refreshing report:", error);
              // Handle error appropriately
            }
          }
        } else {
          console.warn("Invalid refreshTime for report:", report); // Log a warning for debugging
        }
      });

      await Promise.all(refreshPromises);
    }, 60 * 1000); // Check every minute
    return () => clearInterval(intervalId);
  };

  const handleRefreshAll = async () => {
    try {
      const response = await fetch("http://localhost:3001/refresh-all-reports");
      const data = await response.json();
      console.log(data.message); // Log the success message

      // Optionally, re-fetch the report list to show updated 'dateLastRun'
      fetchReports();
    } catch (error) {
      console.error("Error refreshing reports:", error);
      // Handle error appropriately (e.g., display an error message)
    }
  };

  const handleReportClick = (reportData) => {
    // navigate("/final", { state: reportData });
    navigate("/final", {
      state: {
        reportId: reportData.id,
        resultId: reportData.resultId,
        reportName: reportData.reportName,
      },
    });
  };

  const handleAddReportClick = () => {
    navigate("/section1");
  };

  // Handle checkbox changes
  const handleCheckboxChange = (event, reportId) => {
    event.stopPropagation();
    setSelectedReports((prevSelected) => {
      if (prevSelected.includes(reportId)) {
        return prevSelected.filter((id) => id !== reportId);
      } else {
        return [...prevSelected, reportId];
      }
    });

    // Update selectAll if not all reports are selected
    setSelectAll(selectedReports.length + 1 === reportList.length);
  };

  // Handle "Select All" checkbox change
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setSelectedReports(selectAll ? [] : reportList.map((report) => report.id));
  };

  // Handle "Delete Selected" button click
  const handleDeleteSelected = async () => {
    if (selectedReports.length === 0) {
      alert("Please select at least one report to delete.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete the selected reports?")
    ) {
      return;
    }

    try {
      // Delete selected reports and their associated results from Firestore
      const deletePromises = selectedReports.map(async (reportId) => {
        // 1. Get the resultId from the "Live Report" document
        const liveReportDocRef = doc(db, "Live Report", reportId);
        const liveReportDocSnap = await getDoc(liveReportDocRef);
        const resultId = liveReportDocSnap.data().resultId;

        // 2. Delete the "Live Report" document
        await deleteDoc(liveReportDocRef);

        // 3. Delete the corresponding "report_results" document
        if (resultId) {
          const resultDocRef = doc(db, "Report Result", resultId);
          await deleteDoc(resultDocRef);
        }
      });

      await Promise.all(deletePromises);

      // Update the reportList state
      setReportList((prevList) =>
        prevList.filter((report) => !selectedReports.includes(report.id))
      );

      setSelectedReports([]);
      alert("Selected reports and their results deleted successfully!");
    } catch (error) {
      console.error("Error deleting reports:", error);
      alert("Failed to delete reports. Please try again.");
    }
  };

  // const handleEditClick = (reportData) => {
  //   // Navigate to the appropriate section for editing (e.g., Section1)
  //   // You'll need to decide how you want to handle editing and pass the reportData
  //   // navigate("/section1", { state: reportData }); // Example: Navigate to Section1 with the report data
  //   navigate("/section1", { state: { ...reportData, isEditing: true } });
  // };
  const handleEditClick = (report) => {
    // Fetch the corresponding "report_results" document
    const fetchReportResults = async () => {
      try {
        const resultDocRef = doc(db, "Report Result", report.resultId);
        const resultDocSnap = await getDoc(resultDocRef);

        if (resultDocSnap.exists()) {
          const resultData = resultDocSnap.data();
          // Combine report data and results for editing
          const completeReportData = { ...report, ...resultData };

          // Navigate to Section1 with the complete report data and isEditing flag
          navigate("/section1", {
            state: { ...completeReportData, isEditing: true },
          });
        } else {
          console.log("No results found for this report!");
          // Handle the case where the results document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching report results:", error);
        // Handle error appropriately
      }
    };

    fetchReportResults();
  };

  return (
    <div>
      <h1>{companyName}'s Reports</h1>
      {/* {companyName && <p>Company: {companyName}</p>}{" "} */}
      {/* Display company name if available */}
      <button onClick={handleLogout}>Logout</button> {/* Add Logout button */}
      <button onClick={handleAddReportClick}>Add Report</button>{" "}
      <button onClick={handleRefreshAll}>Refresh All Reports</button>
      {/* Add Report button */}
      {reportList.length > 0 ? (
        <table className="report-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>{" "}
              <th>Report Name</th>
              <th>Report ID</th>
              <th>Date Created</th>
              <th>Date Last Run</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportList.map((report) => (
              <tr key={report.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={(event) => handleCheckboxChange(event, report.id)}
                  />
                </td>
                <td
                  onClick={() => handleReportClick(report)}
                  style={{ cursor: "pointer" }}
                >
                  {" "}
                  {/* Make report name clickable, check if reportName exists */}
                  {report && report.reportName
                    ? report.reportName.replace(".json", "")
                    : ""}
                </td>

                <td
                  onClick={() => handleReportClick(report)}
                  style={{ cursor: "pointer" }}
                >
                  {" "}
                  {/* Make report name clickable */}
                  {report.id}
                </td>

                <td onClick={() => handleReportClick(report)}>
                  {" "}
                  {/* Make date created clickable */}
                  {new Date(report.timestamp).toLocaleString()}
                </td>
                <td onClick={() => handleReportClick(report)}>
                  {" "}
                  {/* Make last run date clickable */}
                  {new Date(report.dateLastRun).toLocaleString()}
                </td>
                <td>
                  {" "}
                  {/* Actions cell */}
                  <EditOutlined
                    onClick={() => handleEditClick(report)}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.2em",
                      color: "blue",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reports found.</p>
      )}
      {/* Delete Selected button */}
      <button
        onClick={handleDeleteSelected}
        disabled={selectedReports.length === 0}
      >
        Delete Report
      </button>
    </div>
  );
};

export default ConfirmationPage;
