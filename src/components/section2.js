import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Section2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve section1Values from previous step
  // const dimensions = location.state?.dimensions || [];

  const {
    dimensions,
    isEditing,
    id: reportId,
    resultId: resultId,
  } = location.state || {}; // Get reportId

  // State to manage the selected metric
  const [selectedMetric, setSelectedMetric] = useState(null);

  console.log(resultId);

  useEffect(() => {
    if (isEditing && reportId) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "Live Report", reportId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const reportData = docSnap.data();
            setSelectedMetric(reportData.metric);
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
  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedMetric) {
      navigate("/section3", {
        state: {
          ...location.state,
          metric: selectedMetric,
        },
      });
    } else {
      alert("Please select a metric.");
    }
  };

  return (
    <div>
      <h1>Choose Metrics</h1>
      <p>You can only select one option:</p>

      <form>
        <label>
          <input
            type="radio"
            name="metric"
            value="totalUsers"
            checked={selectedMetric === "totalUsers"}
            onChange={handleMetricChange}
          />{" "}
          Total Users
        </label>
        <div>
          <label>
            <input
              type="radio"
              name="metric"
              value="revenue"
              checked={selectedMetric === "revenue"}
              onChange={handleMetricChange}
            />{" "}
            Revenue
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="metric"
              value="eventCount"
              checked={selectedMetric === "eventCount"}
              onChange={handleMetricChange}
            />{" "}
            Event Count
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="metric"
              value="views"
              checked={selectedMetric === "views"}
              onChange={handleMetricChange}
            />{" "}
            Views
          </label>
        </div>
      </form>

      <button onClick={handleSubmit}>Next</button>
    </div>
  );
};

export default Section2;
