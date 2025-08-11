import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RentalProvider } from './context/RentalContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RentalProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
              },
            }}
          />
        </RentalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);