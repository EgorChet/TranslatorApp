import React, { useState, useEffect } from "react";
import axios from "axios";
import AddApplicationForm from "./AddApplicationForm";
import { Grid, Card, CardContent, Typography, Button, Box, CardActionArea } from "@mui/material";

const apiBaseUrl = `${process.env.REACT_APP_API_BASE_URL}/api/applications`;

const formatDate = (isoDateString) => {
  return isoDateString !== "Not deployed yet" ? new Date(isoDateString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "Not deployed yet";
};

const fetchApplicationsData = async () => {
  const response = await axios.get(apiBaseUrl);
  const apps = response.data;
  const deploymentDatesRes = await Promise.all(apps.map(app => axios.get(`${apiBaseUrl}/${app}/deployment-date`)));
  const deploymentDates = deploymentDatesRes.reduce((acc, res, index) => ({
    ...acc,
    [apps[index]]: formatDate(res.data.lastDeployed)
  }), {});
  return { applications: apps, deploymentDates };
};

const downloadTranslations = async (appName) => {
  const response = await axios.get(`${apiBaseUrl}/${appName}/translations`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${appName}-translations.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};

const deployTranslations = async (appName, setDeploymentDates) => {
  await axios.post(`${apiBaseUrl}/${appName}/deploy`);
  alert(`Translations for '${appName}' deployed successfully.`);
  // Re-fetch deployment date to update the UI
  const response = await axios.get(`${apiBaseUrl}/${appName}/deployment-date`);
  setDeploymentDates(prev => ({ ...prev, [appName]: formatDate(response.data.lastDeployed) }));
};

const GeneralAppsPage = ({ onAddApplication, setSelectedApp }) => {
  const [applications, setApplications] = useState([]);
  const [deploymentDates, setDeploymentDates] = useState({});

  useEffect(() => {
    fetchApplicationsData().then(({ applications, deploymentDates }) => {
      setApplications(applications);
      setDeploymentDates(deploymentDates);
    }).catch(console.error);
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom align="center">My Applications</Typography>
      <Grid container spacing={3} justifyContent="center">
        {applications.map(appName => (
          <Grid item xs={12} sm={6} key={appName}>
            <Card>
              <CardActionArea onClick={() => setSelectedApp(appName)}>
                <CardContent>
                  <Typography variant="h5">{appName}</Typography>
                  <Typography color="text.secondary">Last Deployed: {deploymentDates[appName]}</Typography>
                </CardContent>
              </CardActionArea>
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                <Button onClick={() => downloadTranslations(appName)}>Download XLSX</Button>
                <Button color="primary" onClick={() => deployTranslations(appName, setDeploymentDates)} sx={{ ml: 1 }}>Deploy</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={5} display="flex" justifyContent="center">
        <AddApplicationForm onAddApplication={appName => {
          setApplications(prev => [...prev, appName]);
          onAddApplication(appName);
        }} />
      </Box>
    </div>
  );
};

export default GeneralAppsPage;