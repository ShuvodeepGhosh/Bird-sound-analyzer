import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #2A2A2A' }}>
      <Toolbar>
        <Box component={RouterLink} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" style={{ fontWeight: 'bolder' }}>
            ChirpCheck
          </Typography>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
