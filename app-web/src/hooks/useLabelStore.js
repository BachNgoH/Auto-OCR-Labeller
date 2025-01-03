import { useState, useCallback } from "react";

export const useLabelStore = () => {
  // Store format: { [imageId]: Label[] }
  const [labelsByImage, setLabelsByImage] = useState({});

  const getLabelsForImage = useCallback(
    (imageId) => {
      return labelsByImage[imageId] || [];
    },
    [labelsByImage]
  );

  const setLabelsForImage = useCallback((imageId, labels) => {
    setLabelsByImage((prev) => ({
      ...prev,
      [imageId]: labels,
    }));
  }, []);

  const addLabelToImage = useCallback((imageId, label) => {
    setLabelsByImage((prev) => ({
      ...prev,
      [imageId]: [...(prev[imageId] || []), label],
    }));
  }, []);

  const deleteLabelFromImage = useCallback((imageId, labelId) => {
    setLabelsByImage((prev) => ({
      ...prev,
      [imageId]: prev[imageId]?.filter((label) => label.id !== labelId) || [],
    }));
  }, []);

  const updateLabelInImage = useCallback((imageId, labelId, updates) => {
    setLabelsByImage((prev) => ({
      ...prev,
      [imageId]:
        prev[imageId]?.map((label) =>
          label.id === labelId ? { ...label, ...updates } : label
        ) || [],
    }));
  }, []);

  return {
    getLabelsForImage,
    setLabelsForImage,
    addLabelToImage,
    deleteLabelFromImage,
    updateLabelInImage,
  };
};
