import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ImageLabeler from "../components/ImageLabeler";
import LabelList from "../components/LabelList";
import { useLabelStore } from "../hooks/useLabelStore";
import { projectApi, labelApi } from "../services/api";

const RECOGNITION_ENGINES = {
  easyocr: "EasyOCR",
  paddle: {
    label: "PaddleOCR",
    options: {
      recognizer: ["ch_PP-OCRv4", "en_PP-OCRv4"],
      detector: ["ch_PP-OCRv4_det", "en_PP-OCRv4_det"],
    },
  },
};

function Project() {
  const { projectId } = useParams();
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const labelStore = useLabelStore();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState("easyocr");
  const [paddleOptions, setPaddleOptions] = useState({
    recognizer: "ch_PP-OCRv4",
    detector: "ch_PP-OCRv4_det",
  });
  const [projectDetails, setProjectDetails] = useState(null);

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

  // Add new useEffect for loading project details
  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const details = await projectApi.getDetails(projectId);
        setProjectDetails(details);
      } catch (error) {
        console.error("Failed to load project details:", error);
      }
    };
    loadProjectDetails();
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
    <div className="px-8 py-8 h-screen bg-gray-50">
      <div className="flex items-center justify-between bg-white shadow-sm rounded-lg px-6 py-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="h-6 w-px bg-gray-200" /> {/* Vertical divider */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {projectDetails?.name || "Loading..."}
            </h1>
            {projectDetails?.description && (
              <p className="text-sm text-gray-500">
                {projectDetails.description}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Settings
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-10">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                OCR Engine
              </h3>
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full text-sm border rounded-md px-2 py-1 bg-white mb-3"
              >
                {Object.entries(RECOGNITION_ENGINES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {typeof value === "string" ? value : value.label}
                  </option>
                ))}
              </select>

              {selectedEngine === "paddle" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Recognizer Model
                    </label>
                    <select
                      value={paddleOptions.recognizer}
                      onChange={(e) =>
                        setPaddleOptions((prev) => ({
                          ...prev,
                          recognizer: e.target.value,
                        }))
                      }
                      className="w-full text-sm border rounded-md px-2 py-1 bg-white"
                    >
                      {RECOGNITION_ENGINES.paddle.options.recognizer.map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Detector Model
                    </label>
                    <select
                      value={paddleOptions.detector}
                      onChange={(e) =>
                        setPaddleOptions((prev) => ({
                          ...prev,
                          detector: e.target.value,
                        }))
                      }
                      className="w-full text-sm border rounded-md px-2 py-1 bg-white"
                    >
                      {RECOGNITION_ENGINES.paddle.options.detector.map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Left Sidebar - now more compact */}
        <div className="w-72 bg-white rounded-xl shadow-lg p-4 overflow-y-auto border border-gray-100">
          <div className="flex flex-col gap-2 mb-4">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer text-center text-sm font-medium shadow-sm hover:shadow-md">
              Upload Images
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
            </label>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md">
              Export Labels
            </button>
            <button
              onClick={handleCleanProjectLabels}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              Clean All Labels
            </button>
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <p className="text-gray-500 text-center py-4">
                Loading images...
              </p>
            ) : images.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No images uploaded yet
              </p>
            ) : (
              images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`cursor-pointer p-2 rounded-lg transition-all ${
                    selectedImage?.id === image.id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <p className="text-sm truncate">{image.filename}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main content area improvements */}
        <div className="flex-1 flex gap-6">
          <div className="flex-1">
            {selectedImage ? (
              <ImageLabeler
                image={`http://localhost:8000/${selectedImage.file_path}`}
                imageId={selectedImage.id}
                labelStore={labelStore}
                className="h-full rounded-xl shadow-lg overflow-hidden"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-lg border border-gray-100">
                <p className="text-gray-500 text-lg">
                  Select an image to start labeling
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar improvements */}
          <div className="w-96">
            <LabelList
              imageId={selectedImage?.id}
              labelStore={labelStore}
              selectedEngine={selectedEngine}
              paddleOptions={paddleOptions}
              className="sticky top-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
