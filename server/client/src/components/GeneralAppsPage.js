import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import ApplicationCard from "./ApplicationCard";
import AddApplicationForm from "./AddApplicationForm";

const GeneralAppsPage = ({
  applications,
  deploymentDates,
  requestDeleteApplication,
  onAddApplication,
  handleDownload,
  onDeploy,
  selectedAppHandler
}) => {

  return (
    <div>
      <Typography variant='h4' gutterBottom align='center'>
        My Applications
      </Typography>
      <Grid container spacing={3} justifyContent='center'>
        {applications.map((appName) => (
          <Grid item xs={12} sm={6} key={appName}>
            <ApplicationCard
              appName={appName}
              deploymentDate={deploymentDates[appName] || "Not deployed yet"}
              onDelete={() => requestDeleteApplication(appName)}
              onDownload={() => handleDownload(appName)}
              onDeploy={onDeploy} // Ensure this is correctly passed
              onSelect={selectedAppHandler}
            />
          </Grid>
        ))}
      </Grid>
      <Box mt={5} display='flex' justifyContent='center'>
        <AddApplicationForm onAddApplication={onAddApplication} />
      </Box>
    </div>
  );
};

export default GeneralAppsPage;
