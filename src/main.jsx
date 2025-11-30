import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from "./app/store.js";
import { Provider } from "react-redux";


import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <ToastContainer position="top-center" theme="colored" autoClose={1000} />
  </Provider>
);
