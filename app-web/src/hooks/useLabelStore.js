import { useState, useCallback } from "react";
import { labelApi } from "../services/api";

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
      [imageId]: [
        ...(prev[imageId] || []),
        {
          ...label,
          box: {
            x: label.x,
            y: label.y,
            width: label.width,
            height: label.height,
          },
        },
      ],
    }));
  }, []);

  const deleteLabelFromImage = useCallback((imageId, labelId) => {
    setLabelsByImage((prev) => ({
      ...prev,
      [imageId]: prev[imageId]?.filter((label) => label.id !== labelId) || [],
    }));
  }, []);

  const updateLabelInImage = useCallback(async (imageId, labelId, updates) => {
    try {
      const updatedLabel = await labelApi.update(labelId, updates);
      setLabelsByImage((prev) => ({
        ...prev,
        [imageId]:
          prev[imageId]?.map((label) =>
            label.id === labelId
              ? {
                  ...label,
                  ...updatedLabel,
                  text: updates.text ?? label.text,
                  box: {
                    x: updatedLabel.x ?? label.box.x,
                    y: updatedLabel.y ?? label.box.y,
                    width: updatedLabel.width ?? label.box.width,
                    height: updatedLabel.height ?? label.box.height,
                  },
                }
              : label
          ) || [],
      }));
      return updatedLabel;
    } catch (error) {
      console.error("Failed to update label:", error);
      throw error;
    }
  }, []);

  return {
    getLabelsForImage,
    setLabelsForImage,
    addLabelToImage,
    deleteLabelFromImage,
    updateLabelInImage,
  };
};
