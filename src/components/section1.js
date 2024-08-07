import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// import image1 from './path/to/your/image1.jpg'; // Replace with your image path

const Section1 = ({ onDimensionChange }) => {
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [customDimension, setCustomDimension] = useState("");
  const location = useLocation();

  const { id: reportId, isEditing } = location.state || {}; // Get reportId

  // State to track selected options using checkboxes
  const [selectedOptions, setSelectedOptions] = useState({
    event_name: false,
    platform: false,
    city: false,
    pagePath: false,
    channelGroup: false,
    sessionSourceMedium: false,
    customDimensions: false,
  });

  const navigate = useNavigate();

  console.log(location.state);

  // useEffect(() => {
  //   if (isEditing && reportName) {
  //     // Fetch data only when editing
  //     const fetchData = async () => {
  //       try {
  //         const docRef = doc(db, "Live Report", reportName);
  //         const docSnap = await getDoc(docRef);

  //         if (docSnap.exists()) {
  //           const reportData = docSnap.data();
  //           const firestoreDimensions = reportData.dimensions || [];

  //           const initialOptions = {};
  //           Object.keys(selectedOptions).forEach((option) => {
  //             initialOptions[option] = firestoreDimensions.includes(option);
  //           });
  //           setSelectedOptions(initialOptions);
  //         } else {
  //           console.log("No such document!");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     };

  //     fetchData();
  //   }
  // }, [isEditing, reportName]);

  useEffect(() => {
    // If editing, fetch data from Firestore based on reportId
    if (isEditing && reportId) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "Live Report", reportId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const reportData = docSnap.data();
            const firestoreDimensions = reportData.dimensions || [];

            const initialOptions = {};
            Object.keys(selectedOptions).forEach((option) => {
              initialOptions[option] = firestoreDimensions.includes(option);
            });
            setSelectedOptions(initialOptions);
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

  // Function to handle checkbox changes
  const handleCheckboxChange = (option) => {
    // Update the state, toggling the selected option
    setSelectedOptions({
      ...selectedOptions, // Copy existing options
      [option]: !selectedOptions[option], // Toggle the specific option
    });
  };

  // Function to handle form submission
  const handleSubmit = () => {
    // Get an array of selected dimension names (where the value is true)
    const selected = Object.keys(selectedOptions).filter(
      (option) => selectedOptions[option]
    );

    // Validation: Check if the selection count is within the valid range
    if (selected.length === 0 || selected.length > 3) {
      alert("Please select 1 to 3 options.");
    } else {
      // Pass all relevant data to the next section, including isEditing and reportId
      navigate("/section2", {
        state: {
          ...location.state,
          dimensions: selected,
        },
      });
    }
  };

  return (
    <div>
      <h1>Dimensions</h1>
      <p>
        You can choose from the following options, with a maximum of 3 options:
      </p>

      {/* <img src={image1} alt="Image 1" />  */}

      {/* Checkboxes for dimensions */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={selectedOptions.event_name}
            onChange={() => handleCheckboxChange("event_name")}
          />{" "}
          Event Name
        </label>
      </div>

      <div>
        {" "}
        {/* Repeat this structure for each dimension */}
        <label>
          <input
            type="checkbox"
            checked={selectedOptions.platform}
            onChange={() => handleCheckboxChange("platform")}
          />{" "}
          Platform
        </label>
      </div>
      <div>
        {" "}
        {/* Repeat this structure for each dimension */}
        <label>
          <input
            type="checkbox"
            checked={selectedOptions.city}
            onChange={() => handleCheckboxChange("city")}
          />{" "}
          City
        </label>
      </div>
      <div>
        {" "}
        {/* Repeat this structure for each dimension */}
        <label>
          <input
            type="checkbox"
            checked={selectedOptions.pagePath}
            onChange={() => handleCheckboxChange("pagePath")}
          />{" "}
          Page Path
        </label>
      </div>
      <div>
        {" "}
        {/* Repeat this structure for each dimension */}
        <label>
          <input
            type="checkbox"
            checked={selectedOptions.channelGroup}
            onChange={() => handleCheckboxChange("channelGroup")}
          />{" "}
          Channel Group
        </label>
      </div>
      <div>
        {" "}
        {/* Repeat this structure for each dimension */}
        <label>
          <input
            type="checkbox"
            checked={selectedOptions.sessionSourceMedium}
            onChange={() => handleCheckboxChange("sessionSourceMedium")}
          />{" "}
          Session Source/Medium
        </label>
      </div>

      {/* ...add checkboxes for other dimensions (city, pagePath, etc.) ... */}

      {/* Submit button */}
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
};

export default Section1;
