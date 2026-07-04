import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(149, 213, 178, 0.2)' }}>
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'text.primary', fontWeight: 'bold' }}>
          BirdSense AI
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="primary" variant="contained" component={RouterLink} to="/upload" sx={{ ml: 2 }}>
            Upload Audio
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
