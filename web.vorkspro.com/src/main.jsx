import { createRoot } from "react-dom/client";
import "driver.js/dist/driver.css";
import "./styles/driver-theme.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { TabsProvider } from "./context/TabsContext";
import { TourProvider } from "./context/TourContext";

createRoot(document.getElementById("root")).render(
  <TabsProvider>
    <TourProvider>
    <TooltipProvider>
      <BrowserRouter basename="/">
        <App />
        <Toaster
          richColors
          position="bottom-right"
          expand={false}
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px" },
          }}
        />
      </BrowserRouter>
    </TooltipProvider>
    </TourProvider>
  </TabsProvider>
);
