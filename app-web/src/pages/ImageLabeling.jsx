import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ImageLabeler from "../components/ImageLabeler";
import LabelList from "../components/LabelList";
import { useLabelStore } from "../hooks/useLabelStore";
import { labelApi } from "../services/api";

function ImageLabeling() {
  const { projectId, imageId } = useParams();
  const labelStore = useLabelStore();

  // Fetch existing labels when component mounts
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labels = await labelApi.getForImage(imageId);
        labelStore.setLabelsForImage(imageId, labels);
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };
    fetchLabels();
  }, [imageId, labelStore]);

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
        <div className="flex-1 bg-gray-100 overflow-auto p-4">
          <ImageLabeler
            image="https://picsum.photos/800/600"
            imageId={imageId}
            labelStore={labelStore}
          />
        </div>

        <div className="w-80 bg-white border-l">
          <LabelList
            imageId={imageId}
            labelStore={labelStore}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default ImageLabeling;
