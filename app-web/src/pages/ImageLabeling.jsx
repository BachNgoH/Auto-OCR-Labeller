import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import ImageLabeler from "../components/ImageLabeler";
import LabelList from "../components/LabelList";

// Sample data
const SAMPLE_LABELS = [
  { id: 1, x: 100, y: 100, width: 200, height: 150, label: "Car" },
  { id: 2, x: 300, y: 200, width: 100, height: 100, label: "Person" },
];

function ImageLabeling() {
  const { projectId, imageId } = useParams();
  const [labels, setLabels] = useState(SAMPLE_LABELS);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/project/${projectId}`}
              className="text-blue-500 hover:text-blue-600"
            >
              ← Back to Project
            </Link>
            <h1 className="text-xl font-semibold">Image {imageId}</h1>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
            Save Labels
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Replace Image Canvas Area with ImageLabeler */}
        <div className="flex-1 bg-gray-100 overflow-auto p-4">
          <ImageLabeler
            image="https://picsum.photos/800/600"
            labels={labels}
            setLabels={setLabels}
          />
        </div>

        {/* Replace Labels Sidebar with LabelList */}
        <div className="w-80 bg-white border-l">
          <LabelList labels={labels} setLabels={setLabels} className="h-full" />
        </div>
      </div>
    </div>
  );
}

export default ImageLabeling;
