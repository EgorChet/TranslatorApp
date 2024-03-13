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
} from "@mui/material";
import GeneralAppsPage from "./components/GeneralAppsPage";
import TranslationManager from "./components/TranslationManager";

const drawerWidth = 240;

function App() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/applications");
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAddApplication = useCallback((newAppName) => {
    setApplications((prevApps) => [...prevApps, newAppName]);
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant='h6' noWrap>
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
            key='My Apps'
            selected={selectedApp === null}
            onClick={() => setSelectedApp(null)}
            sx={{
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
              "&.Mui-selected": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
              "&.Mui-selected:hover": { backgroundColor: "rgba(0, 0, 0, 0.12)" },
            }}
          >
            <ListItemText primary='My Apps' />
          </ListItem>
          {applications.map((app, index) => (
            <ListItem
              button
              key={app}
              selected={selectedApp === app}
              onClick={() => setSelectedApp(app)}
              sx={{
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                "&.Mui-selected": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
                "&.Mui-selected:hover": { backgroundColor: "rgba(0, 0, 0, 0.12)" },
              }}
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
            setSelectedApp={setSelectedApp}
            applications={applications}
            onAddApplication={handleAddApplication}
          />
        )}
      </Box>
    </Box>
  );
}

export default App;