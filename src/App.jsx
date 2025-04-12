import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Template from "./components/template";
import { createContext, useState } from "react";
import NotFound404 from "./components/notfound";
import AddProfile from "./components/addprofile";

export const Globalcontext = createContext();
function App() {
  const [currentpage, setCurrentpage] = useState("all_profiles");
  const [username, setUsername] = useState("");

  return (
    <Globalcontext.Provider
      value={{ currentpage, setCurrentpage, username, setUsername }}
    >
      <BrowserRouter>
        <div className="bg-body_bg min-h-screen">
          <Routes>
            <Route path="/" element={<Template />} />
            <Route path="/:username" element={<Template />} />
            <Route path="/addprofile" element={<AddProfile />} />
            <Route path="*" element={<NotFound404 />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Globalcontext.Provider>
  );
}

export default App;
