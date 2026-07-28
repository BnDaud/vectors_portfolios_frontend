import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Template from "./components/template";
import OwnerRoot from "./components/individualprofile";
import NotFound404 from "./components/notfound";
import AddProfile from "./components/addprofile";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-body_bg min-h-screen">
        <Routes>
          <Route path="/" element={<OwnerRoot />} />
          <Route path="/addprofile" element={<AddProfile />} />
          <Route path="/:trackSlug" element={<Template />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
