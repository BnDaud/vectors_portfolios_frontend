import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Template from "./components/template";
import OwnerRoot from "./components/individualprofile";
import NotFound404 from "./components/notfound";
import AddProfile from "./components/addprofile";
import Login from "./components/login";
import { AuthProvider } from "./components/authContext";
import { ToastProvider } from "./components/toastContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="bg-body_bg min-h-screen">
            <Routes>
              <Route path="/" element={<OwnerRoot />} />
              <Route path="/login" element={<Login />} />
              <Route path="/addprofile" element={<AddProfile />} />
              <Route path="/:trackSlug" element={<Template />} />
              <Route path="*" element={<NotFound404 />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
