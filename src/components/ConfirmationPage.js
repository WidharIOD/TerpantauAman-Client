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
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import db from "../firebaseConfig"; // Assuming you have a firebase.js file for configuration
import { EditOutlined } from "@ant-design/icons"; // Import the Edit icon
import "../style/ConfirmationPage.css";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]); // Track selected reports
  const [selectAll, setSelectAll] = useState(false); // State for "Select All" checkbox

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Live Report"));
        const reports = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          reports.push({
            id: doc.id, // Include the document ID
            reportName: data.reportName,
            timestamp: data.timestamp,
            dateLastRun: data.dateLastRun,
          });
        });
        setReportList(reports);
      } catch (error) {
        console.error("Error fetching reports from Firestore:", error);
        // Handle error (e.g., display an error message)
      }
    };

    fetchReports();
  }, [selectedReports]);

  const handleReportClick = (reportData) => {
    navigate("/final", { state: reportData });
  };

  const handleAddReportClick = () => {
    navigate("/section1"); // Navigate to Section1 to start the report creation flow
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
      return; // User cancelled
    }

    try {
      // Delete selected reports from Firestore
      const deletePromises = selectedReports.map((reportId) =>
        deleteDoc(doc(db, "Live Report", reportId))
      );
      await Promise.all(deletePromises);

      // Update the reportList state
      setReportList((prevList) =>
        prevList.filter((report) => !selectedReports.includes(report.id))
      );

      // Clear selectedReports
      setSelectedReports([]);

      alert("Selected reports deleted successfully!");
    } catch (error) {
      console.error("Error deleting reports:", error);
      alert("Failed to delete reports. Please try again.");
    }
  };

  const handleEditClick = (reportData) => {
    // Navigate to the appropriate section for editing (e.g., Section1)
    // You'll need to decide how you want to handle editing and pass the reportData
    // navigate("/section1", { state: reportData }); // Example: Navigate to Section1 with the report data
    navigate("/section1", { state: { ...reportData, isEditing: true } });
  };

  return (
    <div>
      <h1>Reports</h1>
      <button onClick={handleAddReportClick}>Add Report</button>{" "}
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
                  {/* Make report name clickable */}
                  {report.reportName.replace(".json", "")}
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
