import SidebarContext from "./SidebarContext";
import { useState } from "react";

const SidebarState = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarState;
