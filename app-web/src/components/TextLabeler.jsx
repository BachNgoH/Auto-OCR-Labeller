import { useState } from "react";
import { labelApi } from "../services/api";

const TextLabeler = ({ image, imageId, labelStore }) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newLabel = await labelApi.create({
        imageId,
        text,
        // No coordinates needed for text mode
      });

      labelStore.addLabelToImage(imageId, newLabel);
      setText("");
    } catch (error) {
      console.error("Failed to create label:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <img src={image} alt="To be labeled" className="max-w-full h-auto" />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Enter text label..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Label
        </button>
      </form>
    </div>
  );
};

export default TextLabeler;
