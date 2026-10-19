import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { startDevtoolsGuard } from "./devtoolsGuard";

const container = document.getElementById("root");
let root;
const render = () => {
  root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};
render();

// Blank page while developer tools are open (production only; see devtoolsGuard.js).
startDevtoolsGuard({
  hide: () => root.unmount(),
  show: render,
});
