import React from "react";
import { Card, CardContent, Typography, CardActionArea, IconButton, Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ApplicationCard = ({ appName, deploymentDate, onDelete, onDownload, onDeploy }) => {
  // This function is called when the "Deploy" button is clicked.
  const handleDeploy = async () => {
    await onDeploy(appName); // Execute the deployment action passed from the parent.
    // Optionally, after deploying, you can handle UI updates or notifications here.
  };
  
  return (
    <Card style={{ position: "relative", marginBottom: 2 }}>
      <CardActionArea>
        <CardContent>
          <Typography variant="h5">{appName}</Typography>
          <Typography color="textSecondary" variant="body2">
            Last Deployed: {deploymentDate || "Not deployed yet"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <IconButton
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering CardActionArea onClick
          onDelete(appName); // Call the delete function passed from the parent component.
        }}
        style={{ position: "absolute", top: "5px", right: "5px" }}
        aria-label="Delete application"
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <Button startIcon={<DownloadIcon />} onClick={() => onDownload(appName)} size="small">
          Download XLSX
        </Button>
        <Button
          startIcon={<CloudUploadIcon />}
          onClick={handleDeploy} // Call the local handleDeploy function when clicked.
          size="small"
          sx={{ ml: 1 }}
        >
          Deploy
        </Button>
      </Box>
    </Card>
  );
};

export default ApplicationCard;
