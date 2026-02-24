import { createContext, useContext, useEffect, useState } from "react";

const ProjectDetailContext = createContext();

export const ProjectDetailProvider = ({ children }) => {

  const [timeline, setTimeline] = useState([]);
  const [inProgressBlockagesCount, setInProgressBlockagesCount] = useState(0)

  return (
    <ProjectDetailContext.Provider
      value={{
        setTimeline,
        timeline,
        setInProgressBlockagesCount,
        inProgressBlockagesCount
      }}
    >
      {children}
    </ProjectDetailContext.Provider>
  );
};

export const useProjectDetail = () => useContext(ProjectDetailContext);
