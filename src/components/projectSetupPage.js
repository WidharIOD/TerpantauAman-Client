import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import getAuth
import { db, auth } from "../firebaseConfig";

const ProjectSetupPage = () => {
  const navigate = useNavigate();

  const [serviceAccountFile, setServiceAccountFile] = useState(null);
  const [projectId, setProjectId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [tableId, setTableId] = useState("");
  const [companyName, setCompanyName] = useState(null); // State for company name

  useEffect(() => {
    // Get the currently authenticated user
    const currentUser = getAuth().currentUser;
    console.log(currentUser);

    if (currentUser) {
      // Fetch the company name from Firestore based on the user's UID
      const fetchCompanyName = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCompanyName(userData.companyName);
          } else {
            console.log("User document not found!");
            // Handle the case where the user document doesn't exist (e.g., redirect to registration)
          }
        } catch (error) {
          console.error("Error fetching company name:", error);
          // Handle error appropriately
        }
      };

      fetchCompanyName();
    }
  }, []); // Run this effect only once when the component mounts

  const handleFileChange = (event) => {
    setServiceAccountFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    // ... (validation - same as before) ...

    const currentUser = getAuth().currentUser;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;

        // Save project setup details to Firestore using companyName as the document ID
        const projectSetupData = {
          projectId,
          datasetId,
          tableId,
          serviceAccount: fileContent,
        };

        // Use setDoc to create/update the document with companyName as ID
        await setDoc(
          doc(db, "project_setups", currentUser.uid),
          projectSetupData
        );

        navigate("/home");
      };
      reader.readAsText(serviceAccountFile);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div>
      <h1>Project Setup</h1>

      <input type="file" accept=".json" onChange={handleFileChange} />

      <div>
        <label htmlFor="projectId">Project ID:</label>
        <input
          type="text"
          id="projectId"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="datasetId">Dataset ID:</label>
        <input
          type="text"
          id="datasetId"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="tableId">Table ID:</label>
        <input
          type="text"
          id="tableId"
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit}>Next</button>
    </div>
  );
};

export default ProjectSetupPage;
