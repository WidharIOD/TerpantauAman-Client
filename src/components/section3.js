import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Section3 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve values from previous steps
  const {
    dimensions,
    metric,
    isEditing,
    reportName,
    id: reportId, // Get reportId
    resultId: resultId,
  } = location.state || {};

  // State to manage the selected refresh time
  const [selectedRefreshTime, setSelectedRefreshTime] = useState("5 minutes"); // Default to 5 minutes

  console.log(location.state);

  useEffect(() => {
    if (isEditing && reportId) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "Live Report", reportId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const reportData = docSnap.data();
            setSelectedRefreshTime(reportData.refreshTime);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [isEditing, reportId]); // Dependency array includes reportId

  // Handle radio button change
  const handleRefreshTimeChange = (event) => {
    setSelectedRefreshTime(event.target.value);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedRefreshTime) {
      navigate("/userinfo", {
        state: {
          // dimensions,
          // metric,
          // refreshTime: selectedRefreshTime,
          // reportName, // Pass reportName along (cannot be changed)
          // isEditing,
          // id,
          ...location.state,
          refreshTime: selectedRefreshTime,
          resultId,
        },
      });
    } else {
      alert("Please select a refresh time.");
    }
  };

  return (
    <div>
      <h1>Refresh Time</h1>
      <p>You can only select one option:</p>

      <form>
        <div>
          <label>
            <input
              type="radio"
              name="refreshTime"
              value="5 minutes"
              checked={selectedRefreshTime === "5 minutes"}
              onChange={handleRefreshTimeChange}
            />{" "}
            5 minutes
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="refreshTime"
              value="10 minutes"
              checked={selectedRefreshTime === "10 minutes"}
              onChange={handleRefreshTimeChange}
            />{" "}
            10 minutes
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="refreshTime"
              value="15 minutes"
              checked={selectedRefreshTime === "15 minutes"}
              onChange={handleRefreshTimeChange}
            />{" "}
            15 minutes
          </label>
        </div>
      </form>

      <button onClick={handleSubmit}>Finish</button>
    </div>
  );
};

export default Section3;
