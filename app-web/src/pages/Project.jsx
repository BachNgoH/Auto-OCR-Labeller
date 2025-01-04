import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ImageLabeler from "../components/ImageLabeler";
import LabelList from "../components/LabelList";
import { useLabelStore } from "../hooks/useLabelStore";
import { projectApi, labelApi } from "../services/api";

function Project() {
  const { projectId } = useParams();
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const labelStore = useLabelStore();

  // Load project images
  useEffect(() => {
    const loadImages = async () => {
      try {
        const projectImages = await projectApi.getImages(projectId);
        setImages(projectImages);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load images:", error);
        setIsLoading(false);
      }
    };
    loadImages();
  }, [projectId]);

  // Handle file uploads
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    try {
      await projectApi.uploadImages(projectId, files);
      // Reload images after upload
      const updatedImages = await projectApi.getImages(projectId);
      setImages(updatedImages);
    } catch (error) {
      console.error("Failed to upload images:", error);
    }
  };

  const handleCleanProjectLabels = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all labels in this project?"
      )
    ) {
      return;
    }

    try {
      await projectApi.cleanProjectLabels(projectId);
      // You might want to refresh your project data here
    } catch (error) {
      console.error("Failed to clean project labels:", error);
    }
  };

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
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors cursor-pointer text-center">
              Upload Images
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
            </label>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
              Export Labels
            </button>
            <button
              onClick={handleCleanProjectLabels}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Clean All Labels
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-gray-500 text-center">Loading images...</p>
            ) : images.length === 0 ? (
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
                    src={`http://localhost:8000/${image.file_path}`}
                    alt={image.filename}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-gray-800 text-sm truncate">
                      {image.filename}
                    </h3>
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
                image={`http://localhost:8000/${selectedImage.file_path}`}
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
