import "./App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
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
import Signup from "./components/signup";
import { PageOwnerProvider } from "./components/pageOwner";

// /u/<username>/... are another account's pages; everything else is the site owner's
const Account = ({ children }) => {
  const { username } = useParams();
  return <PageOwnerProvider username={username}>{children}</PageOwnerProvider>;
};

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
                <Route path="/signup" element={<Signup />} />
                <Route path="/u/:username" element={<Account><OwnerRoot /></Account>} />
                <Route path="/u/:username/resume/:trackSlug" element={<Account><ResumeViewer /></Account>} />
                <Route path="/u/:username/:trackSlug" element={<Account><Template /></Account>} />
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
