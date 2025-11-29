import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { OutfitProvider } from "./context/OutfitContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <OutfitProvider>
        <App />
      </OutfitProvider>
    </BrowserRouter>
  </React.StrictMode>
);
