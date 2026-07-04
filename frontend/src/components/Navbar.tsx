import React from 'react';
import { AppBar, Toolbar, Button, Box, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(149, 213, 178, 0.2)' }}>
      <Toolbar>
        <Box component={RouterLink} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="ChirpCheck Logo" style={{ height: '40px' }} />
        </Box>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Tooltip title="Coming soon">
            <span>
              <Button color="inherit" disabled sx={{ ml: 1 }}>
                Record Audio
              </Button>
            </span>
          </Tooltip>
          <Button color="primary" variant="contained" component={RouterLink} to="/upload" sx={{ ml: 2 }}>
            Upload Audio
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
