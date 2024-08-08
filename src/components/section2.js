// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../firebaseConfig";

// const Section2 = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Retrieve section1Values from previous step
//   // const dimensions = location.state?.dimensions || [];

//   const {
//     dimensions,
//     isEditing,
//     id: reportId,
//     resultId: resultId,
//   } = location.state || {}; // Get reportId

//   // State to manage the selected metric
//   const [selectedMetric, setSelectedMetric] = useState(null);

//   console.log(resultId);

//   useEffect(() => {
//     if (isEditing && reportId) {
//       const fetchData = async () => {
//         try {
//           const docRef = doc(db, "Live Report", reportId);
//           const docSnap = await getDoc(docRef);

//           if (docSnap.exists()) {
//             const reportData = docSnap.data();
//             setSelectedMetric(reportData.metric);
//           } else {
//             console.log("No such document!");
//           }
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         }
//       };

//       fetchData();
//     }
//   }, [isEditing, reportId]); // Dependency array includes reportId

//   // Handle radio button change
//   const handleMetricChange = (event) => {
//     setSelectedMetric(event.target.value);
//   };

//   // Handle form submission
//   const handleSubmit = () => {
//     if (selectedMetric) {
//       navigate("/section3", {
//         state: {
//           ...location.state,
//           metric: selectedMetric,
//         },
//       });
//     } else {
//       alert("Please select a metric.");
//     }
//   };

//   return (
//     <div>
//       <h1>Choose Metrics</h1>
//       <p>You can only select one option:</p>

//       <form>
//         <label>
//           <input
//             type="radio"
//             name="metric"
//             value="totalUsers"
//             checked={selectedMetric === "totalUsers"}
//             onChange={handleMetricChange}
//           />{" "}
//           Total Users
//         </label>
//         <div>
//           <label>
//             <input
//               type="radio"
//               name="metric"
//               value="revenue"
//               checked={selectedMetric === "revenue"}
//               onChange={handleMetricChange}
//             />{" "}
//             Revenue
//           </label>
//         </div>
//         <div>
//           <label>
//             <input
//               type="radio"
//               name="metric"
//               value="eventCount"
//               checked={selectedMetric === "eventCount"}
//               onChange={handleMetricChange}
//             />{" "}
//             Event Count
//           </label>
//         </div>
//         <div>
//           <label>
//             <input
//               type="radio"
//               name="metric"
//               value="views"
//               checked={selectedMetric === "views"}
//               onChange={handleMetricChange}
//             />{" "}
//             Views
//           </label>
//         </div>
//       </form>

//       <button onClick={handleSubmit}>Next</button>
//     </div>
//   );
// };

// export default Section2;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../style/Section.css";
import FormHeader from "./FormHeader/FormHeader";

const Section2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { dimensions, isEditing, reportName, reportId } = location.state || {}; // Get reportId

  const [selectedMetrics, setSelectedMetrics] = useState({
    total_users: false,
    revenue: false,
    event_count: false,
    views: false,
  });

  useEffect(() => {
    if (isEditing && reportId) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "Live Report", reportId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const reportData = docSnap.data();
            const firestoreMetrics = reportData.metric || []; // Assuming 'metric' is an array in Firestore

            const initialMetrics = {};
            Object.keys(selectedMetrics).forEach((metric) => {
              initialMetrics[metric] = firestoreMetrics.includes(metric);
            });
            setSelectedMetrics(initialMetrics);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [isEditing, reportId]);

  const handleCheckboxChange = (metric) => {
    setSelectedMetrics({
      ...selectedMetrics,
      [metric]: !selectedMetrics[metric],
    });
  };

  const handleSubmit = () => {
    const selected = Object.keys(selectedMetrics).filter(
      (metric) => selectedMetrics[metric]
    );

    if (selected.length === 0 || selected.length > 3) {
      alert("Please select 1 to 3 options.");
    } else {
      navigate("/section3", {
        state: {
          ...location.state,
          metric: selected, // Pass selected metrics as an array
        },
      });
    }
  };

  const selectedCount = Object.values(selectedMetrics).filter(Boolean).length;
  const disableCheckboxes = selectedCount >= 3;

  return (
    <div>
      <FormHeader activeStep={1} />
      <div className="container">
        <h3 className="title">Choose Metrics</h3>
        <p>
          You can choose from the following options, with a maximum of 3
          options:
        </p>

        <form>
          <div className="list-item">
            <label>
              <input
                type="checkbox"
                name="metric"
                value="total_users"
                checked={selectedMetrics.total_users}
                onChange={() => handleCheckboxChange("total_users")}
                disabled={disableCheckboxes && !selectedMetrics.total_users}
              />{" "}
              Total Users
            </label>
          </div>
          <div className="separator"></div>
          <div className="list-item">
            <label>
              <input
                type="checkbox"
                name="metric"
                value="revenue"
                checked={selectedMetrics.revenue}
                onChange={() => handleCheckboxChange("revenue")}
                disabled={disableCheckboxes && !selectedMetrics.revenue}
              />{" "}
              Revenue
            </label>
          </div>
          <div className="separator"></div>
          <div className="list-item">
            <label>
              <input
                type="checkbox"
                name="metric"
                value="event_count"
                checked={selectedMetrics.event_count}
                onChange={() => handleCheckboxChange("event_count")}
                disabled={disableCheckboxes && !selectedMetrics.event_count}
              />{" "}
              Event Count
            </label>
          </div>
          <div className="separator"></div>
          <div className="list-item">
            <label>
              <input
                type="checkbox"
                name="metric"
                value="views"
                checked={selectedMetrics.views}
                onChange={() => handleCheckboxChange("views")}
                disabled={disableCheckboxes && !selectedMetrics.views}
              />{" "}
              Views
            </label>
          </div>
        </form>

        <div className="submit-button-container">
          <button className="submit-button" onClick={handleSubmit}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section2;
