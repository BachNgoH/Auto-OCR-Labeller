import React, { useState } from "react";
import { labelApi, projectApi } from "../services/api";

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

const LabelList = ({ imageId, labelStore, className }) => {
  const labels = labelStore.getLabelsForImage(imageId);
  const [editingText, setEditingText] = useState({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState("easyocr");

  const handleTextChange = (labelId, newText) => {
    setEditingText((prev) => ({
      ...prev,
      [labelId]: newText,
    }));
  };

  const handleTextBlur = async (labelId) => {
    const newText = editingText[labelId];
    if (newText === undefined) return;

    try {
      await labelStore.updateLabelInImage(imageId, labelId, { text: newText });
      setEditingText((prev) => {
        const next = { ...prev };
        delete next[labelId];
        return next;
      });
    } catch (error) {
      console.error("Failed to update label:", error);
    }
  };

  const handleDelete = async (labelId) => {
    try {
      await labelApi.delete(labelId);
      labelStore.deleteLabelFromImage(imageId, labelId);
    } catch (error) {
      console.error("Failed to delete label:", error);
    }
  };

  const handleDetectText = async () => {
    setIsDetecting(true);
    try {
      const projectId = window.location.pathname.split("/")[2];

      // For now, always use easyocr regardless of selection
      const engine = "easyocr";
      const detectedLabels = await projectApi.detectText(
        projectId,
        imageId,
        engine
      );

      // Reload all labels to ensure consistency
      const updatedLabels = await labelApi.getForImage(imageId);
      labelStore.setLabelsForImage(imageId, updatedLabels);
    } catch (error) {
      console.error("Failed to detect text:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCleanLabels = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all labels for this image?"
      )
    ) {
      return;
    }

    try {
      await labelApi.cleanImageLabels(imageId);
      // Refresh labels in store
      labelStore.setLabelsForImage(imageId, []);
    } catch (error) {
      console.error("Failed to clean labels:", error);
    }
  };

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-4`}>
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Labels</h2>
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="text-sm border rounded-md px-2 py-1"
            disabled={isDetecting}
          >
            {Object.entries(RECOGNITION_ENGINES).map(([key, value]) => (
              <option key={key} value={key}>
                {typeof value === "string" ? value : value.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDetectText}
            disabled={isDetecting}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm transition-colors"
          >
            {isDetecting ? "Detecting..." : "Detect Text"}
          </button>
          <button
            onClick={handleCleanLabels}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
          >
            Clean All
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {labels.length === 0 && (
          <p className="text-gray-500 text-center py-4">No labels yet</p>
        )}
        {labels.map((label) => (
          <div
            key={label.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={editingText[label.id] ?? label.text ?? ""}
                onChange={(e) => handleTextChange(label.id, e.target.value)}
                onBlur={() => handleTextBlur(label.id)}
                placeholder="Enter label text"
                className="flex-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-2 py-1"
              />
              <button
                onClick={() => handleDelete(label.id)}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete label"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelList;
