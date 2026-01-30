import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/userContext.jsx'
import { UserVehicleProvider } from './context/userVehicleContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   
    <App />
  
  </StrictMode>,
)
