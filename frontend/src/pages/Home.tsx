import React from 'react';
import { Container, Typography, Button, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '700', letterSpacing: '-0.02em' }} gutterBottom>
        ChirpCheck
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
        Professional bird sound analysis and identification.
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 3, 
        justifyContent: 'center',
        mt: 4 
      }}>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          onClick={() => navigate('/record')}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 'auto' } }}
        >
          Record Live
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
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
