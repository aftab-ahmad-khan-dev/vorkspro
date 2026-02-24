import { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

export const TabsProvider = ({ children }) => {

  const [tabs, setTabs] = useState(null);
  const [actions, setActions] = useState([]);


  return (
    <TabsContext.Provider
      value={{
        tabs,
        setTabs,
        actions,
        setActions
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};

// ✅ Custom hook
export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
