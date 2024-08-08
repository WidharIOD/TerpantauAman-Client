import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function ActiveLastBreadcrumb({ reportName }) {
  const displayReportName = reportName
    ? reportName.replace(".json", "")
    : "Report";

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link underline="hover" color="inherit">
        GA4 Enhancer
      </Link>
      <Link underline="hover" color="inherit" href="/enhancer/">
        Report List
      </Link>
      <Typography color="text.primary">{displayReportName}</Typography>
    </Breadcrumbs>
  );
}
