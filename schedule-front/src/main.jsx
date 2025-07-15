import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { useLocation, BrowserRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Header from "./components/static/Header.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hideHeaderRoutes = ["/login", "/building", "/resetforms"];
  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {showHeader && <Header onLogout={handleLogout} />}
      <App />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
