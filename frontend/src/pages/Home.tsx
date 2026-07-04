import React from 'react';
import { Container, Typography, Button, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
        ChirpCheck
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 3, 
        justifyContent: 'center',
        mt: 4 
      }}>
        <Tooltip title="Coming soon">
          <span>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              disabled
              onClick={() => navigate('/record')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 'auto' } }}
            >
              Record Live
            </Button>
          </span>
        </Tooltip>
        <Button 
          variant="outlined" 
          color="secondary" 
          size="large" 
          onClick={() => navigate('/upload')}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 'auto' } }}
        >
          Upload Audio File
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
