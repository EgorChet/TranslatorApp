import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CssBaseline,
  Drawer,
  Box,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import GeneralAppsPage from "./components/GeneralAppsPage";
import TranslationManager from "./components/TranslationManager";

const drawerWidth = 240;

function App() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState("");
  const [deploymentDates, setDeploymentDates] = useState({});

  const selectedAppHandler = (appName) => {
    setSelectedApp(appName);
  };

  const formatDate = (isoDateString) => {
    if (!isoDateString || isoDateString === "Not deployed yet") {
      return "Not deployed yet";
    }
    const date = new Date(isoDateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };

  const fetchApplicationsAndDates = useCallback(async () => {
    try {
      const appData = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/applications`);
      // Сортировка данных приложений по алфавиту
      const sortedAppData = appData.data.sort((a, b) => a.localeCompare(b));
      setApplications(sortedAppData);

      const dates = {};
      for (const appName of sortedAppData) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/applications/${appName}/deployment-date`
        );
        // Используем formatDate для форматирования даты
        const formattedDate = formatDate(response.data.lastDeployed);
        dates[appName] = formattedDate; // Сохраняем отформатированную дату
      }
      setDeploymentDates(dates);
    } catch (error) {
      console.error("Error fetching applications or deployment dates:", error);
    }
  }, []);

  useEffect(() => {
    fetchApplicationsAndDates();
  }, [fetchApplicationsAndDates]);

  const handleAddApplication = useCallback(
    (appName) => {
      setApplications((prev) => [...prev, appName]);
      fetchApplicationsAndDates();
    },
    [fetchApplicationsAndDates]
  );

  const requestDeleteApplication = useCallback((appName) => {
    setAppToDelete(appName);
    setOpenDialog(true);
  }, []);

  const handleDeleteApplication = useCallback(async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/applications/${encodeURIComponent(appToDelete)}`
      );
      setOpenDialog(false);
      setAppToDelete("");
      fetchApplicationsAndDates();
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  }, [appToDelete, fetchApplicationsAndDates]);

  const handleDeployApplication = useCallback(
    async (appName) => {
      try {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/applications/${appName}/deploy`
        );
        fetchApplicationsAndDates();
      } catch (error) {
        console.error("Deployment failed for ", appName, ": ", error);
      }
    },
    [fetchApplicationsAndDates]
  );

  const handleDownload = useCallback(async (appName) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/applications/${appName}/translations`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${appName}-translations.xlsx`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading translations for app:", appName, error);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", overflowX: "hidden" }}>
      <CssBaseline />
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant='h6' noWrap component='div'>
            Translation Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          <ListItem
            button
            key='All Apps'
            selected={selectedApp === null}
            onClick={() => setSelectedApp(null)}
          >
            <ListItemText primary='All Apps' />
          </ListItem>
          {applications.map((app) => (
            <ListItem
              button
              key={app}
              selected={selectedApp === app}
              onClick={() => setSelectedApp(app)}
            >
              <ListItemText primary={app} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component='main'
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {selectedApp ? (
          <TranslationManager appName={selectedApp} />
        ) : (
          <GeneralAppsPage
            applications={applications}
            deploymentDates={deploymentDates}
            requestDeleteApplication={requestDeleteApplication}
            onAddApplication={handleAddApplication}
            onDeploy={handleDeployApplication}
            handleDownload={handleDownload}
            selectedAppHandler={selectedAppHandler}
          />
        )}
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{"Confirm deletion"}</DialogTitle>
        <DialogContent>
          {"Are you sure you want to delete this application? This action cannot be undone."}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteApplication} color='primary'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
