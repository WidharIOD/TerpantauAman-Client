import "./FormHeader.css";
import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

function FormHeader({ activeStep }) {
  const steps = [
    "Select Dimensions",
    "Select Metrics",
    "Select Refresh Time",
    "Confirm Report",
  ];

  return (
    <div className="headerform-container">
      <h2>Create Custom Realtime Report</h2>
      <p>
        Save your custom report and share it with your team for seamless
        collaboration
      </p>

      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </div>
  );
}

export default FormHeader;
