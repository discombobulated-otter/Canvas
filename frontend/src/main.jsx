import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './App.jsx'
import Home from './components/Home.jsx';
import CanvasComp from './components/Canvas.jsx';
import Backendcanvas from './components/BackendCanvas.jsx';
import JoinCanvas from './components/JoinCanvas.jsx';
import { AnimatePresence } from 'framer-motion';
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log(PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
   <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" >

   <Router>
    <Routes>
      <Route path='/' element={<App><Home/></App>}/>
      <Route path='/canvas' element={<App><CanvasComp/></App>}/>
      <Route path='/project/:id' element={<App><Backendcanvas /></App>}/>
      <Route path='/joinCanvas' element={<App><JoinCanvas /></App>}/>
    </Routes>
   </Router>
   
    </ClerkProvider>
  </StrictMode>,
)
