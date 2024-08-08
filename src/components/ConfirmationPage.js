// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   collection,
//   getDocs,
//   deleteDoc,
//   doc,
//   getDoc,
//   setDoc,
//   onSnapshot,
// } from "firebase/firestore";
// import { getAuth, signOut } from "firebase/auth"; // Import signOut
// import { db, auth } from "../firebaseConfig";
// import { EditOutlined } from "@ant-design/icons";
// import "../style/ConfirmationPage.css";

// const ConfirmationPage = () => {
//   const navigate = useNavigate();
//   const [reportList, setReportList] = useState([]);
//   const [selectedReports, setSelectedReports] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [companyName, setCompanyName] = useState(null); // State to store company name

//   const fetchCompanyName = async () => {
//     const user = getAuth().currentUser;
//     // console.log(user.uid);
//     if (user) {
//       try {
//         const userDocRef = doc(db, "users", user.uid);
//         const userDocSnap = await getDoc(userDocRef);
//         if (userDocSnap.exists()) {
//           setCompanyName(userDocSnap.data().companyName);
//         } else {
//           console.log("User document not found!");
//         }
//       } catch (error) {
//         console.error("Error fetching company name:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchReports();
//     fetchCompanyName(); // Fetch company name when component mounts

//     // // Set up an interval to refresh reports every 5 minutes (adjust as needed)
//     // const intervalId = setInterval(async () => {
//     //   try {
//     //     const response = await fetch(
//     //       "http://localhost:3001/refresh-all-reports"
//     //     );
//     //     const data = await response.json();
//     //     console.log(data.message);

//     //     // Re-fetch the report list to show updated 'dateLastRun'
//     //     fetchReports();
//     //   } catch (error) {
//     //     console.error("Error refreshing reports:", error);
//     //   }
//     // }, 5 * 60 * 1000); // 5 minutes in milliseconds

//     // // Clean up the interval when the component unmounts
//     // return () => clearInterval(intervalId);
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate("/"); // Navigate to LoginPage after logout
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   const fetchReports = async () => {
//     try {
//       // Use onSnapshot for real-time updates
//       const unsubscribe = onSnapshot(
//         collection(db, "Live Report"),
//         (querySnapshot) => {
//           const reports = [];
//           querySnapshot.forEach((doc) => {
//             const data = doc.data();
//             reports.push({
//               id: doc.id,
//               reportName: data.reportName,
//               timestamp: data.timestamp,
//               dateLastRun: data.dateLastRun,
//               resultId: data.resultId,
//               refreshTime: data.refreshTime,
//             });
//           });
//           setReportList(reports);
//         }
//       );

//       return () => unsubscribe(); // Clean up the listener on unmount
//     } catch (error) {
//       console.error("Error fetching reports from Firestore:", error);
//     }
//   };

//   const handleRefreshAll = async () => {
//     try {
//       const response = await fetch("http://localhost:3001/refresh-all-reports");
//       const data = await response.json();
//       console.log(data.message); // Log the success message

//       // Optionally, re-fetch the report list to show updated 'dateLastRun'
//       fetchReports();
//     } catch (error) {
//       console.error("Error refreshing reports:", error);
//       // Handle error appropriately (e.g., display an error message)
//     }
//   };

//   const handleReportClick = (reportData) => {
//     // navigate("/final", { state: reportData });
//     navigate("/final", {
//       state: {
//         reportId: reportData.id,
//         resultId: reportData.resultId,
//         reportName: reportData.reportName,
//       },
//     });
//   };

//   const handleAddReportClick = () => {
//     navigate("/section1");
//   };

//   // Handle checkbox changes
//   const handleCheckboxChange = (event, reportId) => {
//     event.stopPropagation();
//     setSelectedReports((prevSelected) => {
//       if (prevSelected.includes(reportId)) {
//         return prevSelected.filter((id) => id !== reportId);
//       } else {
//         return [...prevSelected, reportId];
//       }
//     });

//     // Update selectAll if not all reports are selected
//     setSelectAll(selectedReports.length + 1 === reportList.length);
//   };

//   // Handle "Select All" checkbox change
//   const handleSelectAllChange = () => {
//     setSelectAll(!selectAll);
//     setSelectedReports(selectAll ? [] : reportList.map((report) => report.id));
//   };

//   // Handle "Delete Selected" button click
//   const handleDeleteSelected = async () => {
//     if (selectedReports.length === 0) {
//       alert("Please select at least one report to delete.");
//       return;
//     }

//     if (
//       !window.confirm("Are you sure you want to delete the selected reports?")
//     ) {
//       return;
//     }

//     try {
//       // Delete selected reports and their associated results from Firestore
//       const deletePromises = selectedReports.map(async (reportId) => {
//         // 1. Get the resultId from the "Live Report" document
//         const liveReportDocRef = doc(db, "Live Report", reportId);
//         const liveReportDocSnap = await getDoc(liveReportDocRef);
//         const resultId = liveReportDocSnap.data().resultId;

//         // 2. Delete the "Live Report" document
//         await deleteDoc(liveReportDocRef);

//         // 3. Delete the corresponding "report_results" document
//         if (resultId) {
//           const resultDocRef = doc(db, "Report Result", resultId);
//           await deleteDoc(resultDocRef);
//         }
//       });

//       await Promise.all(deletePromises);

//       // Update the reportList state
//       setReportList((prevList) =>
//         prevList.filter((report) => !selectedReports.includes(report.id))
//       );

//       setSelectedReports([]);
//       alert("Selected reports and their results deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting reports:", error);
//       alert("Failed to delete reports. Please try again.");
//     }
//   };

//   // const handleEditClick = (reportData) => {
//   //   // Navigate to the appropriate section for editing (e.g., Section1)
//   //   // You'll need to decide how you want to handle editing and pass the reportData
//   //   // navigate("/section1", { state: reportData }); // Example: Navigate to Section1 with the report data
//   //   navigate("/section1", { state: { ...reportData, isEditing: true } });
//   // };
//   const handleEditClick = (report) => {
//     // Fetch the corresponding "report_results" document
//     const fetchReportResults = async () => {
//       try {
//         const resultDocRef = doc(db, "Report Result", report.resultId);
//         const resultDocSnap = await getDoc(resultDocRef);

//         if (resultDocSnap.exists()) {
//           const resultData = resultDocSnap.data();
//           // Combine report data and results for editing
//           const completeReportData = { ...report, ...resultData };

//           // Navigate to Section1 with the complete report data and isEditing flag
//           navigate("/section1", {
//             state: { ...completeReportData, isEditing: true },
//           });
//         } else {
//           console.log("No results found for this report!");
//           // Handle the case where the results document doesn't exist
//         }
//       } catch (error) {
//         console.error("Error fetching report results:", error);
//         // Handle error appropriately
//       }
//     };

//     fetchReportResults();
//   };

//   return (
//     <div>
//       <h1>{companyName}'s Reports</h1>
//       {/* {companyName && <p>Company: {companyName}</p>}{" "} */}
//       {/* Display company name if available */}
//       <button onClick={handleLogout}>Logout</button> {/* Add Logout button */}
//       <button onClick={handleAddReportClick}>Add Report</button>{" "}
//       <button onClick={handleRefreshAll}>Refresh All Reports</button>
//       {/* Add Report button */}
//       {reportList.length > 0 ? (
//         <table className="report-table">
//           <thead>
//             <tr>
//               <th>
//                 <input
//                   type="checkbox"
//                   checked={selectAll}
//                   onChange={handleSelectAllChange}
//                 />
//               </th>{" "}
//               <th>Report Name</th>
//               <th>Report ID</th>
//               <th>Date Created</th>
//               <th>Date Last Run</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reportList.map((report) => (
//               <tr key={report.id}>
//                 <td>
//                   <input
//                     type="checkbox"
//                     checked={selectedReports.includes(report.id)}
//                     onChange={(event) => handleCheckboxChange(event, report.id)}
//                   />
//                 </td>
//                 <td
//                   onClick={() => handleReportClick(report)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   {" "}
//                   {/* Make report name clickable, check if reportName exists */}
//                   {report && report.reportName
//                     ? report.reportName.replace(".json", "")
//                     : ""}
//                 </td>

//                 <td
//                   onClick={() => handleReportClick(report)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   {" "}
//                   {/* Make report name clickable */}
//                   {report.id}
//                 </td>

//                 <td onClick={() => handleReportClick(report)}>
//                   {" "}
//                   {/* Make date created clickable */}
//                   {new Date(report.timestamp).toLocaleString()}
//                 </td>
//                 <td onClick={() => handleReportClick(report)}>
//                   {" "}
//                   {/* Make last run date clickable */}
//                   {new Date(report.dateLastRun).toLocaleString()}
//                 </td>
//                 <td>
//                   {" "}
//                   {/* Actions cell */}
//                   <EditOutlined
//                     onClick={() => handleEditClick(report)}
//                     style={{
//                       cursor: "pointer",
//                       fontSize: "1.2em",
//                       color: "blue",
//                     }}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No reports found.</p>
//       )}
//       {/* Delete Selected button */}
//       <button
//         onClick={handleDeleteSelected}
//         disabled={selectedReports.length === 0}
//       >
//         Delete Report
//       </button>
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
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getAuth, signOut, getIdToken } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import { EditOutlined } from "@ant-design/icons";
import "../style/ConfirmationPage.css";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [companyName, setCompanyName] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchCompanyName = async () => {
    const user = getAuth().currentUser;
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
    fetchCompanyName();
  }, []);

  useEffect(() => {
    if (companyName) {
      fetchReports();
    }
  }, [companyName]);

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth);
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //   }
  // };

  const handleLogout = async () => {
    try {
      // Make a request to the backend logout endpoint
      await fetch("http://localhost:3001/logout", { method: "POST" });

      // Sign out from Firebase Authentication (client-side)
      await signOut(auth);

      navigate("/"); // Navigate to LoginPage after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // const fetchReports = async () => {
  //   try {
  //     const unsubscribe = onSnapshot(
  //       query(
  //         collection(db, "Live Report"),
  //         where("resultId", ">=", `${companyName}-`),
  //         where("resultId", "<=", `${companyName}-\uf8ff`)
  //       ),
  //       (querySnapshot) => {
  //         const reports = [];
  //         querySnapshot.forEach((doc) => {
  //           const data = doc.data();
  //           reports.push({
  //             id: doc.id,
  //             reportName: data.reportName,
  //             timestamp: data.timestamp,
  //             dateLastRun: data.dateLastRun,
  //             resultId: data.resultId,
  //             refreshTime: data.refreshTime,
  //           });
  //         });
  //         setReportList(reports);
  //       }
  //     );

  //     return () => unsubscribe();
  //   } catch (error) {
  //     console.error("Error fetching reports from Firestore:", error);
  //   }
  // };
  const fetchReports = async () => {
    setIsLoading(true); // Set loading state to true

    try {
      // Get the ID token of the currently authenticated user
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const idToken = await getIdToken(user);

      const response = await fetch("http://localhost:3001/get-reports", {
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken, // Include the ID token in the Authorization header
        },
        credentials: "include", // Ensure cookies are sent with the request (if applicable)
      });

      if (!response.ok) {
        // Check if the response is not OK (status code not in the 200-299 range)
        throw new Error("Failed to fetch reports from backend");
      }

      const data = await response.json();
      setReportList(data.reports);
      setFilteredReviews(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Handle the error appropriately (e.g., display an error message to the user)
    } finally {
      setIsLoading(false); // Set loading state to false after fetch completes (regardless of success or failure)
    }
  };

  const handleRefreshAll = async () => {
    try {
      const response = await fetch("http://localhost:3001/refresh-all-reports");
      const data = await response.json();
      console.log(data.message);

      // Re-fetch the report list to show updated 'dateLastRun'
      fetchReports();
    } catch (error) {
      console.error("Error refreshing reports:", error);
    }
  };

  const handleReportClick = (reportData) => {
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

  const handleCheckboxChange = (event, reportId) => {
    event.stopPropagation();
    setSelectedReports((prevSelected) => {
      if (prevSelected.includes(reportId)) {
        return prevSelected.filter((id) => id !== reportId);
      } else {
        return [...prevSelected, reportId];
      }
    });

    setSelectAll(selectedReports.length + 1 === reportList.length);
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setSelectedReports(selectAll ? [] : reportList.map((report) => report.id));
  };

  // const handleDeleteSelected = async () => {
  //   if (selectedReports.length === 0) {
  //     alert("Please select at least one report to delete.");
  //     return;
  //   }

  //   if (
  //     !window.confirm("Are you sure you want to delete the selected reports?")
  //   ) {
  //     return;
  //   }

  //   try {
  //     const deletePromises = selectedReports.map(async (reportId) => {
  //       const liveReportDocRef = doc(db, "Live Report", reportId);
  //       const liveReportDocSnap = await getDoc(liveReportDocRef);
  //       const resultId = liveReportDocSnap.data().resultId;

  //       await deleteDoc(liveReportDocRef);

  //       if (resultId) {
  //         const resultCollection = collection(db, resultId);
  //         const resultCollectionSnap = await getDocs(resultCollection);

  //         const deleteRowPromises = resultCollectionSnap.docs.map((rowDoc) =>
  //           deleteDoc(rowDoc.ref)
  //         );

  //         await Promise.all(deleteRowPromises);

  //         const resultDocRef = doc(db, "Report Result", resultId);
  //         await deleteDoc(resultDocRef);
  //       }
  //     });

  //     await Promise.all(deletePromises);

  //     setReportList((prevList) =>
  //       prevList.filter((report) => !selectedReports.includes(report.id))
  //     );

  //     setSelectedReports([]);
  //     alert("Selected reports and their results deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting reports:", error);
  //     alert("Failed to delete reports. Please try again.");
  //   }
  // };

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
      // Get the ID token of the currently authenticated user
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const idToken = await getIdToken(user);

      // Send delete request to backend
      const response = await fetch("http://localhost:3001/delete-reports", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({ reportIds: selectedReports }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete reports on the backend");
      }

      // Re-fetch the report list from the backend
      fetchReports();

      setSelectedReports([]);
      alert("Selected reports and their results deleted successfully!");
    } catch (error) {
      console.error("Error deleting reports:", error);
      alert("Failed to delete reports. Please try again.");
    }
  };

  const handleEditClick = (report) => {
    const fetchReportResults = async () => {
      try {
        const resultCollection = collection(db, report.resultId);
        const resultCollectionSnap = await getDocs(resultCollection);

        const resultData = resultCollectionSnap.docs.map((doc) => doc.data());

        const completeReportData = { ...report, results: resultData };

        console.log(completeReportData);

        navigate("/section1", {
          state: { ...completeReportData, isEditing: true },
        });
      } catch (error) {
        console.error("Error fetching report results:", error);
      }
    };

    // Call fetchReportResults to get existing data and handle editing
    fetchReportResults();
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <h1>{companyName}'s Reports</h1>
      <button onClick={handleLogout}>Logout</button>
      <button
        onClick={handleAddReportClick}
        disabled={reportList.length >= 3} // Disable button if there are 3 or more reports
      >
        Add Report
      </button>
      <button onClick={handleRefreshAll}>Refresh All Reports</button>
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
              </th>
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
                  {report && report.reportName
                    ? report.reportName.replace(".json", "")
                    : ""}
                </td>
                <td
                  onClick={() => handleReportClick(report)}
                  style={{ cursor: "pointer" }}
                >
                  {report.resultId}
                </td>
                <td onClick={() => handleReportClick(report)}>
                  {new Date(report.timestamp).toLocaleString()}
                </td>
                <td onClick={() => handleReportClick(report)}>
                  {new Date(report.dateLastRun).toLocaleString()}
                </td>
                <td>
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

// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   collection,
//   getDocs,
//   deleteDoc,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import { getAuth, signOut } from "firebase/auth";
// import { db, auth } from "../firebaseConfig";
// import { EditOutlined } from "@ant-design/icons";
// import { DataGrid, gridClasses } from "@mui/x-data-grid";
// import { alpha, styled } from "@mui/material/styles";
// import Button from "@mui/material/Button";
// import SearchBar from "./SearchBar/SearchBar";
// import "../style/ConfirmationPage.css";

// const ConfirmationPage = () => {
//   const navigate = useNavigate();
//   const [reportList, setReportList] = useState([]);
//   const [selectedReports, setSelectedReports] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [companyName, setCompanyName] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredReviews, setFilteredReviews] = useState([]);

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "Live Report"));
//         const reports = [];
//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           reports.push({
//             id: doc.id,
//             reportName: data.reportName,
//             timestamp: data.timestamp,
//             dateLastRun: data.dateLastRun,
//             resultId: data.resultId, // Include the resultId from "Live Report"
//             refreshTime: data.refreshTime,
//           });
//         });
//         setReportList(reports);
//         // Check if any reports need refreshing
//         // await refreshReportsIfNeeded(reports);
//       } catch (error) {
//         console.error("Error fetching reports from Firestore:", error);
//       }
//     };

//     fetchReports();
//   }, []);

//   useEffect(() => {
//     const fetchCompanyName = async () => {
//       const user = getAuth().currentUser;
//       // console.log(user.uid);
//       if (user) {
//         try {
//           const userDocRef = doc(db, "users", user.uid);
//           const userDocSnap = await getDoc(userDocRef);
//           if (userDocSnap.exists()) {
//             setCompanyName(userDocSnap.data().companyName);
//           } else {
//             console.log("User document not found!");
//           }
//         } catch (error) {
//           console.error("Error fetching company name:", error);
//         }
//       }
//     };

//     fetchCompanyName();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate("/"); // Navigate to LoginPage after logout
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   const refreshReportsIfNeeded = async (reports) => {
//     // ... (same as before)
//   };

//   const handleRefreshAll = async () => {
//     // ... (same as before)
//   };

//   const handleReportClick = (reportData) => {
//     navigate("/final", {
//       state: {
//         reportId: reportData.id,
//         resultId: reportData.resultId,
//         reportName: reportData.reportName,
//       },
//     });
//   };

//   const handleAddReportClick = () => {
//     navigate("/section1");
//   };

//   // Handle checkbox changes
//   const handleCheckboxChange = (event, reportId) => {
//     // Only stop propagation if the checkbox is being checked
//     if (event.target.checked) {
//       event.stopPropagation();
//     }

//     setSelectedReports((prevSelected) => {
//       if (prevSelected.includes(reportId)) {
//         return prevSelected.filter((id) => id !== reportId);
//       } else {
//         return [...prevSelected, reportId];
//       }
//     });

//     // Update selectAll only if it was previously true and an item is being unchecked
//     if (selectAll && !event.target.checked) {
//       setSelectAll(false);
//     } else {
//       // Check if all reports are now selected
//       setSelectAll(selectedReports.length + 1 === reportList.length);
//     }
//   };

//   // Handle "Select All" checkbox change
//   const handleSelectAllChange = () => {
//     setSelectAll(!selectAll);
//     setSelectedReports(selectAll ? [] : reportList.map((report) => report.id));
//   };

//   // Handle "Delete Selected" button click
//   const handleDeleteSelected = async () => {
//     if (selectedReports.length === 0) {
//       alert("Please select at least one report to delete.");
//       return;
//     }

//     if (
//       !window.confirm("Are you sure you want to delete the selected reports?")
//     ) {
//       return;
//     }

//     try {
//       // Delete selected reports and their associated results from Firestore
//       const deletePromises = selectedReports.map(async (reportId) => {
//         // 1. Get the resultId from the "Live Report" document
//         const liveReportDocRef = doc(db, "Live Report", reportId);
//         const liveReportDocSnap = await getDoc(liveReportDocRef);
//         const resultId = liveReportDocSnap.data().resultId;

//         // 2. Delete the "Live Report" document
//         await deleteDoc(liveReportDocRef);

//         // 3. Delete the corresponding "report_results" document
//         if (resultId) {
//           const resultDocRef = doc(db, "Report Result", resultId);
//           await deleteDoc(resultDocRef);
//         }
//       });

//       await Promise.all(deletePromises);

//       // Update the reportList state
//       setReportList((prevList) =>
//         prevList.filter((report) => !selectedReports.includes(report.id))
//       );

//       setSelectedReports([]);
//       alert("Selected reports and their results deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting reports:", error);
//       alert("Failed to delete reports. Please try again.");
//     }
//   };

//   const handleEditClick = (report) => {
//     // Fetch the corresponding "report_results" document
//     const fetchReportResults = async () => {
//       try {
//         const resultDocRef = doc(db, "Report Result", report.resultId);
//         const resultDocSnap = await getDoc(resultDocRef);

//         if (resultDocSnap.exists()) {
//           const resultData = resultDocSnap.data();
//           // Combine report data and results for editing
//           const completeReportData = { ...report, ...resultData };

//           // Navigate to Section1 with the complete report data and isEditing flag
//           navigate("/section1", {
//             state: { ...completeReportData, isEditing: true },
//           });
//         } else {
//           console.log("No results found for this report!");
//           // Handle the case where the results document doesn't exist
//         }
//       } catch (error) {
//         console.error("Error fetching report results:", error);
//         // Handle error appropriately
//       }
//     };

//     fetchReportResults();
//   };

//   // Filter and map columns based on selectedColumnIds
//   const filterReviews = useCallback(() => {
//     let filteredData = reportList;

//     if (searchQuery) {
//       const regex = new RegExp(searchQuery, "i");
//       filteredData = filteredData.filter((review) =>
//         Object.values(review).some((value) => regex.test(value))
//       );
//     }

//     setFilteredReviews(filteredData);
//   }, [searchQuery, reportList]);

//   useEffect(() => {
//     filterReviews();
//   }, [searchQuery, reportList]); // Remove filterReviews from dependency array

//   const handleSearchSubmit = (query) => {
//     setSearchQuery(query);
//   };

//   // Define columns for DataGrid (adjust as needed)
//   const columns = [
//     // {
//     //   field: "id",
//     //   headerName: "Select",
//     //   width: 70,
//     //   renderCell: (params) => (
//     //     <input
//     //       type="checkbox"
//     //       checked={selectedReports.includes(params.row.id)}
//     //       onChange={(event) => handleCheckboxChange(event, params.row.id)}
//     //     />
//     //   ),
//     // },
//     { field: "reportName", headerName: "Report Name", width: 200 },
//     { field: "id", headerName: "Report ID", width: 150 },
//     {
//       field: "timestamp",
//       headerName: "Date Created",
//       width: 200,
//       renderCell: (params) => new Date(params.row.timestamp).toLocaleString(),
//     },
//     {
//       field: "dateLastRun",
//       headerName: "Last Modified",
//       width: 200,
//       renderCell: (params) => new Date(params.row.dateLastRun).toLocaleString(),
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 100,
//       renderCell: (params) => (
//         <div className="actions-cell">
//           <EditOutlined
//             onClick={() => handleEditClick(params.row)}
//             style={{
//               cursor: "pointer",
//               fontSize: "1.2em",
//               color: "blue",
//             }}
//           />
//         </div>
//       ),
//     },
//   ];

//   // Styling for the DataGrid
//   const ODD_OPACITY = 0.2;
//   const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
//     [`& .${gridClasses.row}.even`]: {
//       backgroundColor: theme.palette.grey[200],
//       "&:hover": {
//         backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
//         "@media (hover: none)": {
//           backgroundColor: "transparent",
//         },
//       },
//       "&.Mui-selected": {
//         backgroundColor: alpha(
//           theme.palette.primary.main,
//           ODD_OPACITY + theme.palette.action.selectedOpacity
//         ),
//         "&:hover": {
//           backgroundColor: alpha(
//             theme.palette.primary.main,
//             ODD_OPACITY +
//               theme.palette.action.selectedOpacity +
//               theme.palette.action.hoverOpacity
//           ),
//           "@media (hover: none)": {
//             backgroundColor: alpha(
//               theme.palette.primary.main,
//               ODD_OPACITY + theme.palette.action.selectedOpacity
//             ),
//           },
//         },
//       },
//     },
//   }));

//   return (
//     <div>
//       {" "}
//       <h1>{companyName}'s Reports</h1>
//       <button onClick={handleLogout}>Logout</button>
//       <button onClick={handleAddReportClick}>Add Report</button>
//       <button onClick={handleRefreshAll}>Refresh All Reports</button>
//       {reportList.length > 0 ? (
//         <div style={{ height: 400, width: "100%" }}>
//           <SearchBar onSearchSubmit={handleSearchSubmit} />
//           <StripedDataGrid
//             rows={filteredReviews}
//             columns={columns}
//             pageSizeOptions={[5, 10]}
//             checkboxSelection
//             onSelectionModelChange={(newSelection) => {
//               setSelectedReports(newSelection.selectionModel);
//             }}
//             onRowClick={(params) => handleReportClick(params.row)}
//             getRowClassName={(params) =>
//               params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
//             }
//           />
//         </div>
//       ) : (
//         <p>No reports found.</p>
//       )}
//       <button
//         onClick={handleDeleteSelected}
//         disabled={selectedReports.length === 0}
//       >
//         Delete Report
//       </button>
//     </div>
//   );
// };

// export default ConfirmationPage;
