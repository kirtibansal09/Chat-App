import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import "dropzone/dist/dropzone.css";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "./redux/store.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "./context/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ReduxProvider store={store}>
    <SocketProvider>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-right" autoClose={5000} stacked />
      </BrowserRouter>
    </SocketProvider>
  </ReduxProvider>
  // </StrictMode>
);
