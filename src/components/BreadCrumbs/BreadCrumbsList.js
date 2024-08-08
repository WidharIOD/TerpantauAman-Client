import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function BreadcrumbList() {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link underline="hover" color="inherit">
        GA4 Enhancer
      </Link>
      <Typography color="text.primary">Report List</Typography>
    </Breadcrumbs>
  );
}
