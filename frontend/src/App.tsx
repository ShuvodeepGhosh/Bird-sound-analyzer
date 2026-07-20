import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Record from './pages/Record';
import Results from './pages/Results';
import History from './pages/History';
import NotFound from './pages/NotFound';
import { Box } from '@mui/material';

const App: React.FC = () => {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.2)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(45, 212, 191, 0.3)', // primary color
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(45, 212, 191, 0.6)',
          },
        },
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/record" element={<Record />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
