import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, CircularProgress } from "@mui/material";

function TranslationManager({ appName }) {
  const [key, setKey] = useState("");
  const [english, setEnglish] = useState("");
  const [french, setFrench] = useState("");
  const [dutch, setDutch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const translationData = {
      [key]: {
        en: english,
        fr: french,
        nl: dutch,
      },
    };

    axios
      .post(`http://localhost:3000/api/applications/${appName}/add`, translationData)
      .then(() => {
        alert("Translations added successfully!");
        setKey("");
        setEnglish("");
        setFrench("");
        setDutch("");
      })
      .catch((error) => {
        console.error("Error adding translations:", error);
        alert("Failed to add translations.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant='h6' gutterBottom>
        Translation Manager for {appName}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label='Key'
          variant='outlined'
          fullWidth
          margin='normal'
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
        <TextField
          label='English'
          variant='outlined'
          fullWidth
          margin='normal'
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
        />
        <TextField
          label='French'
          variant='outlined'
          fullWidth
          margin='normal'
          value={french}
          onChange={(e) => setFrench(e.target.value)}
        />
        <TextField
          label='Dutch'
          variant='outlined'
          fullWidth
          margin='normal'
          value={dutch}
          onChange={(e) => setDutch(e.target.value)}
        />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Add Translations"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default TranslationManager;
