import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./styles/tailwind.css";
import "./components/arc/foundation.css";
import "./index.css";
import "./styles/arc-bridge.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics: page views and visitors (Analytics tab of the Vercel project). */}
    <Analytics />
  </StrictMode>,
);
