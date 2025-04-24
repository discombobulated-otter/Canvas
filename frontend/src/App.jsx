import { Children, cloneElement, isValidElement, useState } from "react";
import Home from "./components/Home";
import NavBar from "./components/Navbar";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

function App({children}) {

const location = useLocation();

  
  const [save, setSave] = useState(false);
  const enhancedChildren = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child, { key: location.pathname, save, setSave })  // move save/setSave here
      : child
  );
  
  return (
    
  <div className="w-screen h-screen overflow-hidden">
      <NavBar save={save} setSave={setSave} />
      <AnimatePresence  >
      {enhancedChildren}
      </AnimatePresence>
  </div>
    
  );
}

export default App;
