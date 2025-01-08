import { useRef, useEffect } from "react";
import { useLabeling } from "../hooks/useLabeling";
import { useLabelStore } from "../hooks/useLabelStore";
import { labelApi } from "../services/api";

const ImageLabeler = ({
  image,
  imageId,
  labelStore,
  className,
  onLabelingInit,
}) => {
  const canvasRef = useRef(null);
  const labelsLoadedRef = useRef(false);

  const {
    isDrawing,
    currentBox,
    startDrawing,
    updateDrawing,
    finishDrawing,
    getResizeHandle,
    clearCurrentBox,
  } = useLabeling();

  useEffect(() => {
    if (!image || !imageId || labelsLoadedRef.current) return;

    const loadLabels = async () => {
      try {
        const labels = await labelApi.getForImage(imageId);
        const transformedLabels = labels.map((label) => ({
          ...label,
          box: {
            x: label.x,
            y: label.y,
            width: label.width,
            height: label.height,
          },
        }));
        labelStore.setLabelsForImage(imageId, transformedLabels);
        labelsLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to load labels:", error);
      }
    };

    loadLabels();
  }, [imageId, labelStore]);

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Cache the image on the canvas element
      canvas.imageCache = img;

      // Get labels for current image
      const currentLabels = labelStore.getLabelsForImage(imageId);
      drawLabels(ctx, currentLabels);

      // Draw current box if we're drawing
      if (isDrawing && currentBox) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentBox.x,
          currentBox.y,
          currentBox.width,
          currentBox.height
        );
      }
    };

    img.src = image;
  }, [image, imageId, labelStore, isDrawing, currentBox]);

  const drawLabels = (ctx, labels) => {
    labels.forEach((label) => {
      // Draw the bounding box
      ctx.strokeStyle = label.verified ? "green" : "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        label.box.x,
        label.box.y,
        label.box.width,
        label.box.height
      );

      // Draw the label text above the box
      ctx.font = "14px Arial";
      ctx.fillStyle = label.verified ? "green" : "#b7a429";
      ctx.fillText(
        label.text || "Unlabeled",
        label.box.x,
        label.box.y - 5 // Position text 5 pixels above the box
      );
    });
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    startDrawing(point);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    updateDrawing(point);

    // Redraw the canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Instead of creating a new image, draw directly on the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvas.imageCache, 0, 0);

    // Draw existing labels
    const currentLabels = labelStore.getLabelsForImage(imageId);
    drawLabels(ctx, currentLabels);

    // Draw current box
    if (currentBox) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );
    }
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;

    const box = await finishDrawing();
    if (box) {
      try {
        const newLabel = await labelApi.create({
          imageId,
          text: "",
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        });
        labelStore.addLabelToImage(imageId, newLabel);
      } catch (error) {
        console.error("Failed to create label:", error);
        // You might want to show an error notification here
      }
    }
  };

  const getCursorStyle = (e) => {
    if (isDrawing) return "crosshair";

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };

    const handle = getResizeHandle(point, currentBox);
    switch (handle) {
      case "nw":
      case "se":
        return "nwse-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      default:
        return "default";
    }
  };

  const drawBox = (ctx, box, isActive = false) => {
    // Draw the main box
    ctx.strokeStyle = isActive ? "blue" : "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Draw resize handles if box is active
    if (isActive) {
      const handleSize = 8;
      const handles = [
        { x: box.x, y: box.y }, // nw
        { x: box.x + box.width, y: box.y }, // ne
        { x: box.x + box.width, y: box.y + box.height }, // se
        { x: box.x, y: box.y + box.height }, // sw
        { x: box.x + box.width / 2, y: box.y }, // n
        { x: box.x + box.width, y: box.y + box.height / 2 }, // e
        { x: box.x + box.width / 2, y: box.y + box.height }, // s
        { x: box.x, y: box.y + box.height / 2 }, // w
      ];

      ctx.fillStyle = "white";
      ctx.strokeStyle = "blue";
      handles.forEach((point) => {
        ctx.beginPath();
        ctx.rect(
          point.x - handleSize / 2,
          point.y - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fill();
        ctx.stroke();
      });
    }
  };

  useEffect(() => {
    if (onLabelingInit) {
      onLabelingInit({ clearCurrentBox });
    }
  }, [clearCurrentBox]);

  return (
    <div className={`${className} relative group`}>
      {!image && (
        <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-500 text-lg">
            Upload an image to start labeling
          </p>
        </div>
      )}
      <div className="relative overflow-auto">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: getCursorStyle }}
          className="max-w-full h-auto block"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm">
            Click and drag to create a new label
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageLabeler;
