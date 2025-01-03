import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Project from "./pages/Project";
import ImageLabeling from "./pages/ImageLabeling";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:projectId" element={<Project />} />
          <Route
            path="/project/:projectId/image/:imageId"
            element={<ImageLabeling />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
