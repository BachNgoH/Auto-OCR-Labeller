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
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to={`/project/${projectId}`}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span className="text-lg mr-2">←</span>
              Back to Project
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Image {imageId}
            </h1>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Save Labels
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <ImageLabeler
              image="https://picsum.photos/800/600"
              imageId={imageId}
              labelStore={labelStore}
              className="bg-white rounded-xl shadow-lg overflow-auto min-h-[calc(100vh-12rem)]"
            />
          </div>
        </div>

        <div className="w-72 border-l bg-white shadow-lg">
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
