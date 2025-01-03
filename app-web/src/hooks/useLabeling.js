import { useState, useCallback } from "react";

export const useLabeling = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [startPoint, setStartPoint] = useState(null);

  const startDrawing = useCallback((point) => {
    setIsDrawing(true);
    setStartPoint(point);
  }, []);

  const updateDrawing = useCallback(
    (point) => {
      if (!isDrawing || !startPoint) return;

      setCurrentBox({
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        width: Math.abs(point.x - startPoint.x),
        height: Math.abs(point.y - startPoint.y),
      });
    },
    [isDrawing, startPoint]
  );

  const finishDrawing = useCallback(async () => {
    setIsDrawing(false);
    const finalBox = currentBox;
    setCurrentBox(null);
    setStartPoint(null);
    return finalBox;
  }, [currentBox]);

  return {
    isDrawing,
    currentBox,
    startDrawing,
    updateDrawing,
    finishDrawing,
  };
};
