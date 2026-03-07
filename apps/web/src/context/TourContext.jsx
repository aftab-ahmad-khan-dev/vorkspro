import { createContext, useContext, useCallback } from "react";
import { driver } from "driver.js";
import { SIDEBAR_STEPS, getPageSteps } from "@/config/tours";

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const triggerTour = useCallback((path) => {
    const pageSteps = getPageSteps(path);
    const allSteps = [...SIDEBAR_STEPS, ...pageSteps];
    const steps = allSteps
      .filter((s) => document.getElementById(s.id))
      .map(({ id, ...rest }) => ({
        element: `#${id}`,
        popover: rest,
      }));

    if (steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      steps,
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
    });
    driverObj.drive();
  }, []);

  return (
    <TourContext.Provider value={{ triggerTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  return ctx;
}
