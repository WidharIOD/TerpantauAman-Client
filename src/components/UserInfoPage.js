import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addDoc, doc, setDoc, collection, getDoc } from "firebase/firestore";
import db from "../firebaseConfig";

const UserInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileData = location.state;

  // Retrieve values from previous steps
  // const dimensions = location.state?.dimensions || [];
  // const metric = location.state?.metric || null;
  // const refreshTime = location.state?.refreshTime || "";
  //   const [dimensions, setDimensions] = useState([]);
  //   const [metric, setMetric] = useState(null);
  //   const [refreshTime, setRefreshTime] = useState("");

  const {
    dimensions,
    metric,
    refreshTime,
    isEditing,
    reportName: initialReportName,
  } = location.state || {};

  const [reportName, setUserName] = useState(""); // State for user's name
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const [queryResults, setQueryResults] = useState(null);

  useEffect(() => {
    if (isEditing && initialReportName) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "Live Report", initialReportName);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const reportData = docSnap.data();
            setUserName(reportData.reportName);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [isEditing, initialReportName]);

  const handleSubmit = async () => {
    // setDimensions(fileData.dimensions || []);
    // setMetric(fileData.metric || null);
    // setRefreshTime(fileData.refreshTime || "");
    // setUserName(fileData.reportName || "");

    if (!metric) return; // Don't fetch if metric is missing
    if (reportName.trim() === "") {
      // Basic validation (check for empty name)
      alert("Please enter your name.");
      return;
    }
    setIsLoading(true); // Set loading state
    const currentDateTime = new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    });

    try {
      // Fetch data from BigQuery
      // const res = await fetch("http://localhost:3001/query-bigquery", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     dimensions,
      //     metric,
      //     refreshTime,
      //   }),
      // });
      // const bigqueryData = await res.json();

      // Add reportName and selection details to the data
      const dataToSave = {
        reportName,
        dimensions,
        metric,
        refreshTime,
        // results: bigqueryData,
        timestamp: currentDateTime,
        dateLastRun: currentDateTime,
      };

      // **Wait for the first fetch to complete before the second one**
      // Save to Google Cloud Storage
      // const response = await fetch("http://localhost:3001/save-to-gcs", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(dataToSave),
      // });

      // await response.json();
      //   console.log(data);

      // Save to Firestore
      await setDoc(doc(db, "Live Report", reportName), dataToSave);

      console.log("Document written with ID: ", reportName);

      // const docRef = await addDoc(collection(db, "reports"), dataToSave);
      // console.log("Document written with ID: ", docRef.id);

      navigate("/", { state: dataToSave });
    } catch (error) {
      console.error("Error:", error);
      // Handle errors appropriately (e.g., display error messages to the user)
    } finally {
      setIsLoading(false); // Reset loading state
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
        onChange={(e) => setUserName(e.target.value)}
        readOnly={isEditing} // Make it read-only in edit mode
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Processing..." : "Proceed to Results"}
      </button>
    </div>
  );
};

export default UserInfoPage;
