import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Template from "./components/template";
import OwnerRoot from "./components/individualprofile";
import NotFound404 from "./components/notfound";
import AddProfile from "./components/addprofile";
import Login from "./components/login";
import { AuthProvider } from "./components/authContext";
import { ToastProvider } from "./components/toastContext";
import { ThemeProvider } from "./components/themeContext";
import VisitTracker from "./components/visitTracker";
import ResumeViewer from "./components/resumeViewer";
import { LogoWatermark } from "./components/logo";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <VisitTracker />
            <LogoWatermark />
            <div className="bg-body_bg min-h-screen">
              <Routes>
                <Route path="/" element={<OwnerRoot />} />
                <Route path="/login" element={<Login />} />
                <Route path="/addprofile" element={<AddProfile />} />
                <Route path="/resume/:trackSlug" element={<ResumeViewer />} />
                <Route path="/:trackSlug" element={<Template />} />
                <Route path="*" element={<NotFound404 />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
