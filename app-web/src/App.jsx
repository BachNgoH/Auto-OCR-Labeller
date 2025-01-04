import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Project from "./pages/Project";
import ImageLabeling from "./pages/ImageLabeling";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:projectId" element={<Project />} />
            <Route
              path="/project/:projectId/image/:imageId"
              element={<ImageLabeling />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
