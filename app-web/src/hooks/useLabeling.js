import { useState, useCallback } from "react";

export const useLabeling = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const getResizeHandle = useCallback((point, box) => {
    if (!box) return null;
    const threshold = 10; // pixels

    // Check corners first (corners take priority over edges)
    const corners = {
      nw:
        Math.abs(point.x - box.x) <= threshold &&
        Math.abs(point.y - box.y) <= threshold,
      ne:
        Math.abs(point.x - (box.x + box.width)) <= threshold &&
        Math.abs(point.y - box.y) <= threshold,
      se:
        Math.abs(point.x - (box.x + box.width)) <= threshold &&
        Math.abs(point.y - (box.y + box.height)) <= threshold,
      sw:
        Math.abs(point.x - box.x) <= threshold &&
        Math.abs(point.y - (box.y + box.height)) <= threshold,
    };

    // Return the first matching corner
    const corner = Object.entries(corners).find(([, isNear]) => isNear)?.[0];
    if (corner) return corner;

    // If no corner matches, check edges
    const edges = {
      n:
        point.y >= box.y - threshold &&
        point.y <= box.y + threshold &&
        point.x >= box.x &&
        point.x <= box.x + box.width,
      s:
        point.y >= box.y + box.height - threshold &&
        point.y <= box.y + box.height + threshold &&
        point.x >= box.x &&
        point.x <= box.x + box.width,
      e:
        point.x >= box.x + box.width - threshold &&
        point.x <= box.x + box.width + threshold &&
        point.y >= box.y &&
        point.y <= box.y + box.height,
      w:
        point.x >= box.x - threshold &&
        point.x <= box.x + threshold &&
        point.y >= box.y &&
        point.y <= box.y + box.height,
    };

    return Object.entries(edges).find(([, isNear]) => isNear)?.[0] || null;
  }, []);

  const startDrawing = useCallback(
    (point) => {
      const handle = getResizeHandle(point, currentBox);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        setStartPoint(point);
      } else {
        setIsDrawing(true);
        setStartPoint(point);
      }
    },
    [currentBox, getResizeHandle]
  );

  const updateDrawing = useCallback(
    (point) => {
      if (!startPoint) return;

      if (isResizing && currentBox) {
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        const newBox = { ...currentBox };

        switch (resizeHandle) {
          case "nw":
            newBox.x = currentBox.x + dx;
            newBox.y = currentBox.y + dy;
            newBox.width = currentBox.width - dx;
            newBox.height = currentBox.height - dy;
            break;
          case "ne":
            newBox.y = currentBox.y + dy;
            newBox.width = currentBox.width + dx;
            newBox.height = currentBox.height - dy;
            break;
          case "se":
            newBox.width = currentBox.width + dx;
            newBox.height = currentBox.height + dy;
            break;
          case "sw":
            newBox.x = currentBox.x + dx;
            newBox.width = currentBox.width - dx;
            newBox.height = currentBox.height + dy;
            break;
          case "n":
            newBox.y = currentBox.y + dy;
            newBox.height = currentBox.height - dy;
            break;
          case "s":
            newBox.height = currentBox.height + dy;
            break;
          case "e":
            newBox.width = currentBox.width + dx;
            break;
          case "w":
            newBox.x = currentBox.x + dx;
            newBox.width = currentBox.width - dx;
            break;
        }

        setCurrentBox(newBox);
      } else if (isDrawing) {
        setCurrentBox({
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y),
          width: Math.abs(point.x - startPoint.x),
          height: Math.abs(point.y - startPoint.y),
        });
      }
    },
    [isDrawing, isResizing, startPoint, currentBox, resizeHandle]
  );

  const finishDrawing = useCallback(async () => {
    setIsDrawing(false);
    setIsResizing(false);
    setResizeHandle(null);
    const finalBox = currentBox;
    setStartPoint(null);
    return finalBox;
  }, [currentBox]);

  return {
    isDrawing,
    isResizing,
    currentBox,
    startDrawing,
    updateDrawing,
    finishDrawing,
    getResizeHandle,
  };
};
