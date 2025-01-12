import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ImageLabeler from "../components/ImageLabeler";
import LabelList from "../components/LabelList";
import { useLabelStore } from "../hooks/useLabelStore";
import { projectApi, labelApi } from "../services/api";
import TextLabeler from "../components/TextLabeler";

const RECOGNITION_ENGINES = {
  easyocr: "EasyOCR",
  paddle: {
    label: "PaddleOCR",
    options: {
      recognizer: [
        "PP-OCRv4_server_rec",
        "PP-OCRv4_mobile_rec",
        "VietOCR",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gpt-4o",
        "gpt-4o-mini",
      ],
      detector: ["PP-OCRv4_server_det", "PP-OCRv4_mobile_det"],
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
  const [leftWidth, setLeftWidth] = useState(288);
  const [rightWidth, setRightWidth] = useState(384);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const [labelingTools, setLabelingTools] = useState(null);
  const [projectMode, setProjectMode] = useState("bbox");

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
    const fetchProjectDetails = async () => {
      const details = await projectApi.getDetails(projectId);
      setProjectDetails(details);
      setProjectMode(details.mode);
    };
    fetchProjectDetails();
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

  const handleTextModeUpload = async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await projectApi.uploadTextModeFiles(
        projectId,
        formData
      );
      // Refresh images after upload
      fetchImages();
    } catch (error) {
      console.error("Failed to upload files:", error);
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
      labelStore.clearAllLabels();
      // You might want to refresh your project data here
    } catch (error) {
      console.error("Failed to clean project labels:", error);
    }
  };

  // Update the mouse event handler for smoother resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft.current) {
        // Get the container's left edge position
        const container = document.querySelector(".px-8");
        const containerRect = container.getBoundingClientRect();
        const minWidth = 200;
        const maxWidth = Math.min(600, window.innerWidth * 0.4); // 40% of window width

        // Calculate new width relative to container
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, e.clientX - containerRect.left)
        );

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setLeftWidth(newWidth);
        });
      }
      if (isDraggingRight.current) {
        const containerWidth = window.innerWidth - 64; // 64px for padding
        const newWidth = Math.max(250, containerWidth - e.clientX);
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    const handleMouseDown = () => {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none"; // Prevent text selection while dragging
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleExportLabels = async () => {
    try {
      // Trigger file download
      const response = await fetch(
        `http://localhost:8000/api/labels/project/${projectId}/export`
      );
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project_${projectId}_dataset.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export labels:", error);
    }
  };

  // Add this function to receive the labeling tools
  const handleLabelingInit = (tools) => {
    setLabelingTools(tools);
  };

  const getCurrentImageLabels = () => {
    if (!selectedImage?.id) return [];
    return labelStore.getLabelsForImage(selectedImage.id) || [];
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
        {/* Left Sidebar */}
        <div
          style={{ width: leftWidth }}
          className="flex-shrink-0 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-4 h-full overflow-y-auto">
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
              <button
                onClick={handleExportLabels}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md"
              >
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
        </div>

        {/* Left Resize Handle */}
        <div
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors"
          onMouseDown={() => (isDraggingLeft.current = true)}
        />

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {selectedImage ? (
            <div className="h-full overflow-auto">
              {projectMode === "bbox" ? (
                <ImageLabeler
                  image={`http://localhost:8000/${selectedImage.file_path}`}
                  imageId={selectedImage.id}
                  labelStore={labelStore}
                  className="rounded-xl shadow-lg"
                  onLabelingInit={handleLabelingInit}
                  currentLabels={getCurrentImageLabels()}
                />
              ) : (
                <div className="flex flex-col h-full">
                  <TextLabeler
                    image={`http://localhost:8000/${selectedImage.file_path}`}
                    imageId={selectedImage.id}
                    labelStore={labelStore}
                    className="rounded-xl shadow-lg flex-1"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-lg border border-gray-100">
              <p className="text-gray-500 text-lg">
                Select an image to start labeling
              </p>
            </div>
          )}
        </div>

        {/* Right Resize Handle and Sidebar - Only show in bbox mode */}
        {projectMode === "bbox" && (
          <>
            <div
              className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors"
              onMouseDown={() => (isDraggingRight.current = true)}
            />
            <div style={{ width: rightWidth }} className="flex-shrink-0">
              <LabelList
                imageId={selectedImage?.id}
                labelStore={labelStore}
                selectedEngine={selectedEngine}
                paddleOptions={paddleOptions}
                className="sticky top-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100 overflow-y-auto max-h-full"
                clearCurrentBox={labelingTools?.clearCurrentBox}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Project;
