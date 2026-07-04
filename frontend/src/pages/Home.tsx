import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
        BirdSense AI
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
        Identify bird species from audio recordings using state-of-the-art AI. Upload your wildlife recordings and discover the birds around you.
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          onClick={() => navigate('/upload')}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Start Analysis
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
