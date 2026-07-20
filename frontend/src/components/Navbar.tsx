import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHistoryActive = location.pathname === '/history';

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #2A2A2A' }}>
      <Toolbar>
        <Box component={RouterLink} to="/" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" style={{ fontWeight: 'bolder' }}>
            ChirpCheck
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/history"
            variant={isHistoryActive ? "contained" : "outlined"}
            color="primary"
            startIcon={<BookIcon />}
            sx={{
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              fontSize: '1.2rem',
              px: 3,
              py: 0.8,
              borderColor: isHistoryActive ? 'transparent' : 'rgba(216, 243, 220, 0.3)',
              color: isHistoryActive ? 'primary.contrastText' : 'primary.light',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: isHistoryActive ? 'primary.dark' : 'rgba(216, 243, 220, 0.08)',
              }
            }}
          >
            My Discoveries
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
