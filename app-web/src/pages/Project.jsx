import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import ImageLabeler from "../components/ImageLabeler";
import LabelList from "../components/LabelList";
import { useLabelStore } from "../hooks/useLabelStore";

// Sample data
const SAMPLE_IMAGES = [
  {
    id: 1,
    url: "https://picsum.photos/400/300",
    filename: "image1.jpg",
    labelCount: 5,
    lastModified: "2024-03-20",
  },
  {
    id: 2,
    url: "https://picsum.photos/400/301",
    filename: "image2.jpg",
    labelCount: 3,
    lastModified: "2024-03-19",
  },
  {
    id: 3,
    url: "https://picsum.photos/400/302",
    filename: "image3.jpg",
    labelCount: 0,
    lastModified: "2024-03-18",
  },
];

function Project() {
  const { projectId } = useParams();
  const [images] = useState(SAMPLE_IMAGES);
  const [selectedImage, setSelectedImage] = useState(null);
  const labelStore = useLabelStore();

  return (
    <div className="container mx-auto px-4 py-8 h-screen">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/" className="text-blue-500 hover:text-blue-600">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          Project: {projectId}
        </h1>
      </div>

      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Left Sidebar with image list */}
        <div className="w-80 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <div className="flex flex-col gap-4 mb-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Upload Folder
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Upload Images
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
              Export Labels
            </button>
          </div>

          <div className="space-y-4">
            {images.length === 0 ? (
              <p className="text-gray-500 text-center">
                No images uploaded yet
              </p>
            ) : (
              images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.id === image.id
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-gray-800 text-sm truncate">
                      {image.filename}
                    </h3>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{image.labelCount} labels</span>
                      <span>{image.lastModified}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex gap-4">
          <div className="flex-1">
            {selectedImage ? (
              <ImageLabeler
                image={selectedImage.url}
                imageId={selectedImage.id}
                labelStore={labelStore}
                className="h-full"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md">
                <p className="text-gray-500">
                  Select an image to start labeling
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar for labels */}
          <div className="w-80">
            <LabelList
              imageId={selectedImage?.id}
              labelStore={labelStore}
              className="sticky top-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
