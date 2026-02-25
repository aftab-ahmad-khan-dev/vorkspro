import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { TabsProvider } from "./context/TabsContext";

createRoot(document.getElementById("root")).render(
  <TabsProvider>
    <TooltipProvider>
      <BrowserRouter basename="/demo-portal">
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
  </TabsProvider>
);
