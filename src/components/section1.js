// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../firebaseConfig";

// // import image1 from './path/to/your/image1.jpg'; // Replace with your image path

// const Section1 = ({ onDimensionChange }) => {
//   const [selectedDimensions, setSelectedDimensions] = useState([]);
//   const [customDimension, setCustomDimension] = useState("");
//   const location = useLocation();

//   const { id: reportId, isEditing } = location.state || {}; // Get reportId

//   // State to track selected options using checkboxes
//   const [selectedOptions, setSelectedOptions] = useState({
//     event_name: false,
//     platform: false,
//     city: false,
//     pagePath: false,
//     channelGroup: false,
//     sessionSourceMedium: false,
//     customDimensions: false,
//   });

//   const navigate = useNavigate();

//   console.log(location.state);

//   // useEffect(() => {
//   //   if (isEditing && reportName) {
//   //     // Fetch data only when editing
//   //     const fetchData = async () => {
//   //       try {
//   //         const docRef = doc(db, "Live Report", reportName);
//   //         const docSnap = await getDoc(docRef);

//   //         if (docSnap.exists()) {
//   //           const reportData = docSnap.data();
//   //           const firestoreDimensions = reportData.dimensions || [];

//   //           const initialOptions = {};
//   //           Object.keys(selectedOptions).forEach((option) => {
//   //             initialOptions[option] = firestoreDimensions.includes(option);
//   //           });
//   //           setSelectedOptions(initialOptions);
//   //         } else {
//   //           console.log("No such document!");
//   //         }
//   //       } catch (error) {
//   //         console.error("Error fetching data:", error);
//   //       }
//   //     };

//   //     fetchData();
//   //   }
//   // }, [isEditing, reportName]);

//   useEffect(() => {
//     // If editing, fetch data from Firestore based on reportId
//     if (isEditing && reportId) {
//       const fetchData = async () => {
//         try {
//           const docRef = doc(db, "Live Report", reportId);
//           const docSnap = await getDoc(docRef);

//           if (docSnap.exists()) {
//             const reportData = docSnap.data();
//             const firestoreDimensions = reportData.dimensions || [];

//             const initialOptions = {};
//             Object.keys(selectedOptions).forEach((option) => {
//               initialOptions[option] = firestoreDimensions.includes(option);
//             });
//             setSelectedOptions(initialOptions);
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

//   // Function to handle checkbox changes
//   const handleCheckboxChange = (option) => {
//     // Update the state, toggling the selected option
//     setSelectedOptions({
//       ...selectedOptions, // Copy existing options
//       [option]: !selectedOptions[option], // Toggle the specific option
//     });
//   };

//   // Function to handle form submission
//   const handleSubmit = () => {
//     // Get an array of selected dimension names (where the value is true)
//     const selected = Object.keys(selectedOptions).filter(
//       (option) => selectedOptions[option]
//     );

//     // Validation: Check if the selection count is within the valid range
//     if (selected.length === 0 || selected.length > 3) {
//       alert("Please select 1 to 3 options.");
//     } else {
//       // Pass all relevant data to the next section, including isEditing and reportId
//       navigate("/section2", {
//         state: {
//           ...location.state,
//           dimensions: selected,
//         },
//       });
//     }
//   };

//   return (
//     <div>
//       <h1>Dimensions</h1>
//       <p>
//         You can choose from the following options, with a maximum of 3 options:
//       </p>

//       {/* <img src={image1} alt="Image 1" />  */}

//       {/* Checkboxes for dimensions */}
//       <div>
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOptions.event_name}
//             onChange={() => handleCheckboxChange("event_name")}
//           />{" "}
//           Event Name
//         </label>
//       </div>

//       <div>
//         {" "}
//         {/* Repeat this structure for each dimension */}
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOptions.platform}
//             onChange={() => handleCheckboxChange("platform")}
//           />{" "}
//           Platform
//         </label>
//       </div>
//       <div>
//         {" "}
//         {/* Repeat this structure for each dimension */}
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOptions.city}
//             onChange={() => handleCheckboxChange("city")}
//           />{" "}
//           City
//         </label>
//       </div>
//       <div>
//         {" "}
//         {/* Repeat this structure for each dimension */}
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOptions.pagePath}
//             onChange={() => handleCheckboxChange("pagePath")}
//           />{" "}
//           Page Path
//         </label>
//       </div>
//       <div>
//         {" "}
//         {/* Repeat this structure for each dimension */}
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOptions.channelGroup}
//             onChange={() => handleCheckboxChange("channelGroup")}
//           />{" "}
//           Channel Group
//         </label>
//       </div>
//       <div>
//         {" "}
//         {/* Repeat this structure for each dimension */}
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOptions.sessionSourceMedium}
//             onChange={() => handleCheckboxChange("sessionSourceMedium")}
//           />{" "}
//           Session Source/Medium
//         </label>
//       </div>

//       {/* ...add checkboxes for other dimensions (city, pagePath, etc.) ... */}

//       {/* Submit button */}
//       <button onClick={handleSubmit}>Next</button>
//     </div>
//   );
// };

// export default Section1;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../style/Section.css";
import FormHeader from "./FormHeader/FormHeader";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { alpha, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

const Section1 = () => {
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [customDimension, setCustomDimension] = useState("");
  const location = useLocation();
  const { id: reportId, isEditing } = location.state || {};

  const [selectedOptions, setSelectedOptions] = useState({
    event_name: false,
    platform: false,
    city: false,
    page_path: false,
    channel_group: false,
    sessionSourceMedium: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
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
  }, [isEditing, reportId]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions({
      ...selectedOptions,
      [option]: !selectedOptions[option],
    });
  };

  const handleSubmit = () => {
    const selected = Object.keys(selectedOptions).filter(
      (option) => selectedOptions[option]
    );

    if (selected.length === 0 || selected.length > 3) {
      alert("Please select 1 to 3 options.");
    } else {
      navigate("/section2", {
        state: {
          ...location.state,
          dimensions: selected,
        },
      });
    }
  };

  // Determine if the maximum number of selections has been reached
  const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
  const disableCheckboxes = selectedCount >= 3;

  // Define columns for DataGrid
  const columns = [
    {
      field: "dimension",
      headerName: "Dimensions",
      width: 200,
      renderCell: (params) => (
        <div className="list-item">
          <label>
            <input
              type="checkbox"
              checked={selectedOptions[params.row.id]}
              onChange={() => handleCheckboxChange(params.row.id)}
              disabled={disableCheckboxes && !selectedOptions[params.row.id]}
            />
            {params.value}
          </label>
        </div>
      ),
    },
  ];

  // Data for DataGrid
  const rows = Object.keys(selectedOptions).map((key) => ({
    id: key,
    dimension: key.replace("_", " "),
  }));

  // Styling for the DataGrid
  const ODD_OPACITY = 0.2;

  const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    [`& .${gridClasses.row}.even`]: {
      backgroundColor: theme.palette.grey[200],
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
        "@media (hover: none)": {
          backgroundColor: "transparent",
        },
      },
      "&.Mui-selected": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity
        ),
        "&:hover": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY +
              theme.palette.action.selectedOpacity +
              theme.palette.action.hoverOpacity
          ),
          "@media (hover: none)": {
            backgroundColor: alpha(
              theme.palette.primary.main,
              ODD_OPACITY + theme.palette.action.selectedOpacity
            ),
          },
        },
      },
    },
  }));

  return (
    <div>
      <FormHeader activeStep={0} />
      <div className="container">
        <h3 className="title">Dimensions</h3>
        <p>
          You can choose from the following options, with a maximum of 3
          options:
        </p>

        <div style={{ height: 300, width: "50%" }}>
          <StripedDataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 15, 30]}
            checkboxSelection={false} // Disable row selection
            hideFooter
          />
        </div>

        <div className="submit-button-container">
          <button className="submit-button" onClick={handleSubmit}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section1;
