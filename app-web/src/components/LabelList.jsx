import React, { useState } from "react";
import { labelApi, projectApi } from "../services/api";

const LabelList = ({ imageId, labelStore, selectedEngine, className }) => {
  const labels = labelStore.getLabelsForImage(imageId);
  const [editingText, setEditingText] = useState({});
  const [isDetecting, setIsDetecting] = useState(false);

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
      const detectedLabels = await projectApi.detectText(
        projectId,
        imageId,
        selectedEngine
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
    <div className={`${className} flex flex-col h-full`}>
      <div className="flex-none space-y-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Labels</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDetectText}
            disabled={isDetecting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isDetecting ? "Detecting..." : "Detect Text"}
          </button>
          <button
            onClick={handleCleanLabels}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clean All
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {labels.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">No labels yet</p>
          </div>
        )}
        {labels.map((label) => (
          <div
            key={label.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={editingText[label.id] ?? label.text ?? ""}
                onChange={(e) => handleTextChange(label.id, e.target.value)}
                onBlur={() => handleTextBlur(label.id)}
                placeholder="Enter label text"
                className="flex-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1"
              />
              <button
                onClick={() => handleDelete(label.id)}
                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete label"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
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
