import { useState } from "react";
import { Link } from "react-router-dom";

// Sample data
const SAMPLE_PROJECTS = [
  {
    id: 1,
    name: "Car Detection Dataset",
    description: "Collection of street images for car detection",
    imageCount: 145,
    lastUpdated: "2024-03-20",
  },
  {
    id: 2,
    name: "Bird Species",
    description: "Bird classification dataset",
    imageCount: 89,
    lastUpdated: "2024-03-19",
  },
  {
    id: 3,
    name: "Medical Scans",
    description: "X-ray image labeling project",
    imageCount: 56,
    lastUpdated: "2024-03-18",
  },
];

function Home() {
  const [projects] = useState(SAMPLE_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Image Labeling Projects
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          New Project
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {project.name}
              </h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{project.imageCount} images</span>
                <span>Last updated: {project.lastUpdated}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal placeholder - we can implement this later */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2>Create New Project</h2>
            {/* Add form here later */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
