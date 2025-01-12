import { useState, useEffect } from "react";
import { labelApi } from "../services/api";

const TextLabeler = ({ image, imageId, labelStore }) => {
  const [text, setText] = useState("");
  const [latestLabel, setLatestLabel] = useState(null);

  useEffect(() => {
    if (!imageId) return;
    loadLabels();
  }, [imageId]);

  const loadLabels = async () => {
    try {
      const labels = await labelApi.getForImage(imageId);
      labelStore.setLabelsForImage(imageId, labels);
      // Set the latest label if any exists
      if (labels && labels.length > 0) {
        setLatestLabel(labels[0]);
      }
    } catch (error) {
      console.error("Failed to load labels:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const newLabel = await labelApi.create({
        imageId,
        text,
      });

      labelStore.addLabelToImage(imageId, newLabel);
      setLatestLabel(newLabel);
      setText("");
    } catch (error) {
      console.error("Failed to create label:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
          placeholder="Enter text label..."
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg transition-colors disabled:bg-gray-400 text-lg font-medium shadow-sm"
        >
          Add Label
        </button>
      </form>

      <div className="relative flex-1">
        <img
          src={image}
          alt="To be labeled"
          className="w-full h-auto rounded-xl shadow-md object-contain"
        />
      </div>

      {latestLabel && (
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">Label:</span>
            <p className="text-gray-900 font-semibold text-lg">
              {latestLabel.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextLabeler;
