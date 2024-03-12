import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, CircularProgress, Typography, Snackbar } from "@mui/material";

// Example of a simple API call handler (could be further abstracted into a separate file)
const useApplicationAPI = (onSuccess, onError) => {
  const addApplication = async (appName) => {
    try {
      await axios.post("http://localhost:3000/api/applications", { name: appName });
      onSuccess("Application added successfully!");
    } catch (error) {
      onError("Failed to add application.");
    }
  };

  return { addApplication };
};

function AddApplicationForm({ onAddApplication }) {
  const [appName, setAppName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { addApplication } = useApplicationAPI(
    (msg) => {
      setMessage(msg);
      setAppName("");
      setIsSubmitting(false);
      onAddApplication(appName);
    },
    (msg) => {
      setMessage(msg);
      setIsSubmitting(false);
    }
  );

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    addApplication(appName);
  };

  return (
    <>
      <Box component="form" onSubmit={handleFormSubmit} sx={{ maxWidth: 400, mx: "auto", my: 2 }} noValidate autoComplete="off">
        <Typography variant="h6" gutterBottom>Add New Application</Typography>
        <TextField fullWidth id="appName" label="Application Name" variant="outlined" margin="normal" value={appName} onChange={(e) => setAppName(e.target.value)} required placeholder="Enter Application Name" />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ textTransform: "none" }}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Add Application"}
          </Button>
        </Box>
      </Box>
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")} message={message} />
    </>
  );
}

export default AddApplicationForm;
